'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
//import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
//import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { CompaniesFilters } from '@/components/dashboard/integrations/integrations-filters';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import { useForm, Controller } from 'react-hook-form';
import { Select, MenuItem, FormControl, InputLabel } from '@mui/material'; // Importa los componentes necesarios
import { API_URL } from '@/config';

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
interface Category {
  id: number;
  name: string;
  description: string;
  supermarketId: number;
}



export default function Page(): React.JSX.Element {
  const [openCategory, setOpenCategory] = React.useState(false);
  const [openProduct, setOpenProduct] = React.useState(false);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]); // Define el tipo para products
  const [searchTerm, setSearchTerm] = React.useState('');
  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
    },
  });
  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

const handleOpenCategory = () => {
  setOpenCategory(true);
};

const handleCloseCategory = () => {
  setOpenCategory(false);
  reset();
};

const handleOpenProduct = () => {
  setOpenProduct(true);
};

const handleCloseProduct = () => {
  setOpenProduct(false);
  reset();
};

  // Cargar categorías al montar el componente
  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`${API_URL}/categories`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Category[] = await response.json(); // Tipificar explícitamente como array de categorías
        setCategories(data); // Ahora el tipo es seguro
      }
    } catch (error) {
      // Manejo de errores omitido
    }
  };

  // Cargar productos al montar el componente
  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('custom-auth-token');
      const response = await fetch(`${API_URL}/products`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data: Product[] = await response.json(); // Tipificar explícitamente como array de categorías
        setProducts(data); // Ahora el tipo es seguro
      }
    } catch (error) {
      // Manejo de errores omitido
    }
  };

  // Llama a fetchCategories y fetchProducts cuando el componente se monte
  React.useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  interface Supermarket {
    id: number;
  }
  
  interface User {
    ownedSupermarket?: Supermarket;
    supermarket?: Supermarket;
  }

  interface CategoryFormData {
    name: string;
    description: string;
  }
  
  // Función para añadir categoría
  const onSubmitCategory = async (data: CategoryFormData) => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}'); // Tipificar como User
    const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id;
  
    if (!supermarketId) {
      return;
    }
  
    const categoryData = {
      name: data.name,
      description: data.description,
      supermarketId: Number(supermarketId),
    };
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return;
      }
  
      const response = await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(categoryData),
      });
  
      if (response.ok) {
        handleCloseCategory();
        fetchCategories();
      }
    } catch (error) {
      // Manejo de errores omitido
    }
  };
  

  const onSubmitProduct = async (data: {
    name: string;
    description: string;
    price: string; // Cambiar a string porque proviene del formulario
    categoryId: string; // Cambiar a string porque proviene del formulario
  }) => {
    const user: User = JSON.parse(localStorage.getItem('user') || '{}'); // Tipificar como User
    const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id;
  
    if (!supermarketId) {
      return;
    }
  
    const productData = {
      name: data.name,
      description: data.description,
      price: Number(data.price), // Convertir a number
      categoryId: Number(data.categoryId), // Convertir a number
      supermarketId: Number(supermarketId),
    };
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      if (!token) {
        return;
      }
  
      const response = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });
  
      if (response.ok) {
        handleCloseProduct();
        fetchProducts();
      }
    } catch (error) {
      // Manejo de errores omitido
    }
  };
  
  
  // Función para eliminar producto
  const handleDeleteProduct = async (productId: number) => {
    const token = localStorage.getItem('custom-auth-token');
    if (!token) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProducts();
      }
    } catch (error) {
      // Manejo de errores omitido
    }
  };

  

  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Inventario</Typography>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
            {/* <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Importar
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Exportar
            </Button> */}
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenProduct}>
            Añadir Producto
          </Button>
        </div>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenCategory}>
            Añadir Categoria
          </Button>
        </div>
      </Stack>
      <CompaniesFilters onSearch={setSearchTerm} />

          {/* Listado de productos */}
          <Stack spacing={2}>
      <Typography variant="h5">Listado de Productos</Typography>
      {filteredProducts.length > 0 ? (
        filteredProducts.map((product) => (
          <Stack key={product.id} spacing={1} sx={{ border: '1px solid #ccc', padding: 2 }}>
            <Typography variant="h6">{product.name}</Typography>
            <Typography variant="body1">{product.description}</Typography>
            <Typography variant="body2">Precio: ${product.price}</Typography>
            <Typography variant="body2">
              Categoría: {product.category?.name || 'Categoría no encontrada'}
            </Typography>
            <Button
              variant="outlined"
              color="error"
              onClick={() => handleDeleteProduct(product.id)}
            >
              Eliminar
            </Button>
          </Stack>
        ))
      ) : (
        <Typography>No hay productos disponibles.</Typography>
      )}
    </Stack>

      {/* Modal para añadir producto */}
      <Dialog open={openProduct} onClose={handleCloseProduct}>
        <DialogTitle>Añadir Producto</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? fieldState.error.message : ''}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Descripción" fullWidth multiline rows={3} />
              )}
            />
            <Controller
              name="price"
              control={control}
              rules={{ required: 'El precio es obligatorio' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Precio"
                  fullWidth
                  type="number"
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? fieldState.error.message : ''}
                />
              )}
            />
            <Controller
              name="categoryId"
              control={control}
              rules={{ required: 'Debes seleccionar una categoría' }}
              render={({ field, fieldState }) => (
                <FormControl fullWidth error={Boolean(fieldState.error)}>
                  <InputLabel id="category-select-label">Categoría</InputLabel>
                  <Select {...field} label="Categoría" id="category-select">
                  {categories.map((category: { id: number; name: string }) => ( // Asegúrate de tipificar correctamente
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {fieldState.error && <Typography color="error">{fieldState.error.message}</Typography>}
                </FormControl>
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseProduct} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmitProduct)} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal para añadir categoría */}
      <Dialog open={openCategory} onClose={handleCloseCategory}>
        <DialogTitle>Añadir Categoria</DialogTitle>
        <DialogContent>
          <Stack spacing={2}>
            <Controller
              name="name"
              control={control}
              rules={{ required: 'El nombre es obligatorio' }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Nombre"
                  fullWidth
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error ? fieldState.error.message : ''}
                />
              )}
            />
            <Controller
              name="description"
              control={control}
              render={({ field }) => (
                <TextField {...field} label="Descripción" fullWidth multiline rows={3} />
              )}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCategory} color="inherit">
            Cancelar
          </Button>
          <Button onClick={handleSubmit(onSubmitCategory)} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
