import { Request, Response } from "express";
import { Tenant } from "../models/Tenant";
import { cloudinary } from "../config/cloudinary";
import { catchAsync } from "../utils/catchAsync";
import { AppError } from "../utils/AppError";

export const getCurrentTenant = catchAsync(async (req: Request, res: Response) => {
  const tenantId = req.user?.tenantId;

  if (!tenantId) {
    throw new AppError("No tenant associated with this user", 404);
  }

  let tenant = await Tenant.findOne({ slug: tenantId });

  if (!tenant && tenantId === "MAIN-PLATFORM") {
    // Auto-create main platform tenant if missing
    tenant = await Tenant.create({
      name: "StockMaster Global",
      slug: "MAIN-PLATFORM",
      email: "support@stockmaster.pro",
    });
  }

  if (!tenant) {
    throw new AppError("Tenant not found", 404);
  }

  return res.status(200).json({ success: true, data: tenant });
});

export const updateCurrentTenant = catchAsync(async (req: Request, res: Response) => {
  const { tenantId } = req.user!;
  const {
    name,
    logo,
    legalName,
    description,
    address,
    phone,
    email,
    website,
    taxId,
    vatNumber,
    blackFriday,
    settings,
  } = req.body;

  if (!tenantId) {
    throw new AppError("User is not associated with a tenant.", 400);
  }

  const tenant = await Tenant.findOne({ slug: tenantId });
  if (!tenant) {
    throw new AppError("Tenant not found.", 404);
  }

  let logoUrl = tenant.logo;
  if (logo && logo.startsWith("data:image")) {
    const uploadRes = await cloudinary.uploader.upload(logo, {
      folder: "stockmaster_logos",
    });
    logoUrl = uploadRes.secure_url;
  }

  tenant.name = name || tenant.name;
  tenant.logo = logoUrl;
  tenant.legalName = legalName || tenant.legalName;
  tenant.description = description || tenant.description;
  tenant.address = address || tenant.address;
  tenant.phone = phone || tenant.phone;
  tenant.email = email || tenant.email;
  tenant.website = website || tenant.website;
  tenant.taxId = taxId || tenant.taxId;
  tenant.vatNumber = vatNumber || tenant.vatNumber;
  tenant.blackFriday = blackFriday || tenant.blackFriday;
  tenant.settings = settings || tenant.settings;

  const updatedTenant = await tenant.save();

  res.status(200).json({ success: true, data: updatedTenant });
});
