import { Request, Response } from "express";
import Client from "../models/Client";
import Order from "../models/Order";
import { AuthRequest } from "../middlewares/auth.middleware";
import mongoose from "mongoose";

export const getClients = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { search, page = 1, limit = 10 } = req.query;

    const query: any = { tenantId };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const clients = await Client.find(query)
      .limit(Number(limit))
      .skip((Number(page) - 1) * Number(limit))
      .sort({ createdAt: -1 })
      .lean();

    // Logic: Enrich clients with basic operational signals
    const enrichedClients = await Promise.all(clients.map(async (c: any) => {
      const stats = await Order.aggregate([
        { $match: { clientId: c._id } },
        { $group: { _id: null, total: { $sum: "$totalPrice" }, count: { $sum: 1 } } }
      ]);
      return {
        ...c,
        totalSpent: stats[0]?.total || 0,
        orderCount: stats[0]?.count || 0
      };
    }));

    const total = await Client.countDocuments(query);

    res.json({ clients: enrichedClients, total, page, pages: Math.ceil(total / Number(limit)) });
  } catch (error) {
    res.status(500).json({ message: "Error fetching clients", error });
  }
};

export const getClientById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user!;
    
    const client = await Client.findOne({ _id: id, tenantId }).lean();
    if (!client) return res.status(404).json({ message: "Client not found" });

    // Deep Diagnostic: Get full order history signals
    const orders = await Order.find({ clientId: id }).sort({ createdAt: -1 }).limit(10);
    const stats = await Order.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(id) } },
      { $group: { _id: null, total: { $sum: "$totalPrice" }, avg: { $avg: "$totalPrice" }, count: { $sum: 1 } } }
    ]);

    res.json({
      ...client,
      stats: {
        totalSpent: stats[0]?.total || 0,
        averageOrderValue: stats[0]?.avg || 0,
        orderCount: stats[0]?.count || 0,
        recentOrders: orders
      }
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching client", error });
  }
};

export const createClient = async (req: AuthRequest, res: Response) => {
  try {
    const { tenantId } = req.user!;
    const { name, phone, email, address, type, taxId, vatNumber, creditLimit } = req.body;

    const existingClient = await Client.findOne({ phone, tenantId });
    if (existingClient) {
      return res.status(400).json({ message: "Identity Conflict: Phone already indexed in this node." });
    }

    const newClient = new Client({
      tenantId,
      name,
      phone,
      email,
      address,
      type,
      taxId,
      vatNumber,
      creditLimit
    });

    await newClient.save();
    res.status(201).json(newClient);
  } catch (error) {
    res.status(500).json({ message: "Error creating client", error });
  }
};

export const updateClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user!;
    const updates = req.body;

    const client = await Client.findOneAndUpdate(
      { _id: id, tenantId },
      updates,
      { new: true }
    );

    if (!client) return res.status(404).json({ message: "Client not found" });

    res.json(client);
  } catch (error) {
    res.status(500).json({ message: "Error updating client", error });
  }
};

export const deleteClient = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { tenantId } = req.user!;

    const client = await Client.findOneAndDelete({ _id: id, tenantId });

    if (!client) return res.status(404).json({ message: "Client not found" });

    res.json({ message: "Client purged from registry" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting client", error });
  }
};
