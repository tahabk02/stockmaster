import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "../api/client";
import { toast } from "react-hot-toast";

interface Product {
  _id: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  image: string;
  category: any;
  tenantId: string;
  createdAt: string;
}

export const useProductsQuery = () => {
  return useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data } = await api.get("/products");
      return data.data as Product[];
    },
  });
};

export const useCreateProductMutation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newProduct: any) => api.post("/products", newProduct),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit ajouté avec succès");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la création");
    },
  });
};

export const useDeleteProductMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId: string) => api.delete(`/products/${productId}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit supprimé");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Erreur lors de la suppression");
    },
  });
};
