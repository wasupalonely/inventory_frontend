'use client';

import * as React from 'react';
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Box } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { API_URL } from '@/config';
import { Plus, DownloadSimple } from '@phosphor-icons/react';
import { User } from '@/types/user';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category?: {
    id: number;
    name: string;
  };
}

interface Inventory {
  id: number;
  stock: number;
  product: Product;
}

interface SaleProduct {
  productId: number;
  quantity: number;
  productName: string;
  totalPrice: number;
}


export function SalesForm(): React.JSX.Element {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [products, setProducts] = useState<Inventory[]>([]);
  const [productQuantities, setProductQuantities] = useState<SaleProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [availableStock, setAvailableStock] = useState<number>(0);
  const [quantity, setQuantity] = useState<string>('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState<'success' | 'error'>('success');

  // Cargar productos desde el backend
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const user: User = JSON.parse(localStorage.getItem('user') || '{}');
      const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id;

      if (!supermarketId) return;

      const response = await fetch(`${API_URL}/inventory/supermarket/${supermarketId}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Inventory[] = await response.json();
        setProducts(data);
      } else {
        throw new Error('Error al cargar productos');
      }
    } catch {
      setSnackbarMessage('Error al cargar productos');
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    }
  };

  // Manejar selección del producto
  const handleProductChange = (event: SelectChangeEvent<string>) => {
    const productId = Number(event.target.value);
    const selectedInventory = products.find(item => item.product.id === productId);
    if (selectedInventory) {
      setSelectedProduct(selectedInventory.product);
      setAvailableStock(selectedInventory.stock);
    }
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    // Permite solo números positivos y evita valores negativos o símbolos
    if (/^\d+$/.test(value) || value === "") {
      setQuantity(value);
    }
  };

// Añadir producto a la venta
const handleAddProduct = () => {
  if (!selectedProduct || !quantity || parseInt(quantity, 10) <= 0) {
    setSnackbarMessage('Seleccione un producto y una cantidad válida');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return;
  }

  const quantityValue = parseInt(quantity, 10);
  if (quantityValue > availableStock) {
    setSnackbarMessage(`La cantidad no puede exceder el stock disponible (${availableStock})`);
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return;
  }

  setProductQuantities(prev => {
    const existingProductIndex = prev.findIndex(
      item => item.productId === selectedProduct.id
    );

    if (existingProductIndex !== -1) {
      // Si el producto ya existe, actualizar cantidad y precio total
      const updatedQuantities = [...prev];
      const existingProduct = updatedQuantities[existingProductIndex];
      
      // Sumar la nueva cantidad a la cantidad existente
      const newQuantity = existingProduct.quantity + quantityValue;
      updatedQuantities[existingProductIndex] = {
        ...existingProduct,
        quantity: newQuantity,
        totalPrice: newQuantity * selectedProduct.price // Calcular el precio total basado en la cantidad total
      };
      return updatedQuantities;
    }

    // Si el producto no existe, añadir nuevo
    return [
      ...prev,
      {
        productId: selectedProduct.id,
        quantity: quantityValue,
        productName: selectedProduct.name,
        totalPrice: quantityValue * selectedProduct.price,
      },
    ];
  });

  // Actualizar stock en el estado local de products
  setProducts(prevProducts => prevProducts.map(item => {
    if (item.product.id === selectedProduct.id) {
      return {
        ...item,
        stock: item.stock - quantityValue, // Restar la cantidad vendida del stock
      };
    }
    return item;
  }));

  setSelectedProduct(null);
  setQuantity('');
  setAvailableStock(0);

  setSnackbarMessage(`Producto "${selectedProduct.name}" agregado a la venta`);
  setSnackbarSeverity('success');
  setSnackbarOpen(true);
};


  // Eliminar producto
const handleRemoveProduct = (index: number) => {
  const productToRemove = productQuantities[index];
  setProductQuantities(prevQuantities => prevQuantities.filter((_, i) => i !== index));

  // Restaurar el stock del producto eliminado
  setProducts(prevProducts =>
    prevProducts.map(item => {
      if (item.product.id === productToRemove.productId) {
        return {
          ...item,
          stock: item.stock + productToRemove.quantity, // Restaurar el stock
        };
      }
      return item;
    })
  );

    // Verificar si el producto eliminado es el mismo que el seleccionado actualmente
    if (selectedProduct && selectedProduct.id === productToRemove.productId) {
      // Limpiar los campos de producto seleccionado si coincide
      setSelectedProduct(null);
      setAvailableStock(0);
      setQuantity('');
    }

  setSnackbarMessage(`Producto "${productToRemove.productName}" eliminado de la venta`);
  setSnackbarSeverity('success');
  setSnackbarOpen(true);
};

  

  // Enviar venta al backend
  const handleSubmitSale = async () => {
    if (productQuantities.length === 0) {
    setSnackbarMessage('Agregue al menos un producto con cantidad válida antes de finalizar la venta');
    setSnackbarSeverity('error');
    setSnackbarOpen(true);
    return;
  }
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id;

      const saleData = {
        userId: user.id,
        supermarketId,
        productQuantities: productQuantities.map(({ productId, quantity }) => ({
          productId,
          quantity,
        })),
      };

      const response = await fetch(`${API_URL}/sales`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('custom-auth-token')}`,
        },
        body: JSON.stringify(saleData),
      });

      if (!response.ok) {
        throw new Error('Error al realizar la venta');
      }

      setSnackbarMessage('Venta realizada con éxito');
      setSnackbarSeverity('success');
      setProductQuantities([]);

      const sale = await response.json(); // Obtener el objeto de venta creado
    const saleId = sale.id; // Asegúrate de que la respuesta contiene `id` de la venta creada

    // Llamar al endpoint para obtener el PDF de la factura
    const invoiceResponse = await fetch(`${API_URL}/sales/${saleId}/invoice`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('custom-auth-token')}`,
      },
    });

    if (invoiceResponse.ok) {
      const blob = await invoiceResponse.blob();
      const pdfUrl = URL.createObjectURL(blob);
      setPdfUrl(pdfUrl);
      setDialogOpen(true);
      setSnackbarMessage('Venta realizada con éxito');
      setSnackbarSeverity('success');
    } else {
      throw new Error('Error al obtener la factura');
    }
  } catch (error) {
    setSnackbarMessage('Error al realizar la venta');
    setSnackbarSeverity('error');
    console.error(error);
  } finally {
    setSnackbarOpen(true);
  }
};

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <Card>
      <CardHeader title="Registro de Venta" subheader="Añade productos a la venta" />
      <Divider />
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item md={6} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Producto</InputLabel>
              <Select
                label="Producto"
                value={selectedProduct?.id.toString() || ''}
                onChange={handleProductChange}
              >
                {products.map(item => (
                  <MenuItem key={item.product.id} value={item.product.id}>
                    {item.product.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item md={4} xs={12}>
            <FormControl fullWidth>
              <InputLabel>Cantidad</InputLabel>
              <OutlinedInput
                label="Cantidad"
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                inputProps={{
                  max: availableStock,
                  min: 1,
                }}
              />
            </FormControl>
          </Grid>

          <Grid item md={2} xs={12}>
            <Button
              variant="outlined"
              color="primary"
              onClick={handleAddProduct}
              startIcon={<Plus />}
              fullWidth
            >
              Añadir
            </Button>
          </Grid>

          {/* Mostrar información del producto seleccionado */}
          {selectedProduct && (
            <Grid item xs={12}>
              <Card variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Typography variant="h6">{selectedProduct.name}</Typography>
                <Typography>Descripción: {selectedProduct.description}</Typography>
                <Typography>Precio Unitario: ${selectedProduct.price}</Typography>
                <Typography>Stock Disponible: {availableStock}</Typography>
                <Box
        sx={{
          width: 100,
          height: 100,
          border: '1px dashed gray',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mt: 2
        }}
      >
      </Box>
              </Card>
            </Grid>
          )}

          {/* Lista de productos añadidos */}
          {productQuantities.map((item, index) => (
            <Grid item xs={12} key={index}>
              <Card variant="outlined" sx={{ p: 2, display: 'flex', justifyContent: 'space-between' }}>
                <div>
                  <Typography variant="h6">{item.productName}</Typography>
                  <Typography>Cantidad: {item.quantity}</Typography>
                  <Typography>Precio Total: ${item.totalPrice.toFixed(2)}</Typography>
                </div>
                <Box
        sx={{
          width: 70,
          height: 70,
          border: '1px dashed gray',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          ml: 2
        }}
      >
      </Box>
                <Button
                  variant="outlined"
                  color="error"
                  onClick={() => handleRemoveProduct(index)}
                  startIcon={<TrashIcon />}
                >
                  Eliminar
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmitSale}
          sx={{ mt: 3 }}
          fullWidth
        >
          Guardar Venta
        </Button>
      </CardContent>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbarOpen(false)} severity={snackbarSeverity}>
          {snackbarMessage}
        </Alert>
      </Snackbar>

{/* Diálogo de confirmación con vista previa del PDF */}
<Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Typography variant="h6">Se realizó su venta exitosamente</Typography>
          <IconButton
            aria-label="close"
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {pdfUrl && (
            <iframe src={pdfUrl} width="100%" height="500px" title="Vista previa de la factura" />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="primary">
            Cerrar
          </Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
}
