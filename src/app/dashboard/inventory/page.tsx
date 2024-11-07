'use client';

import * as React from 'react';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { Pencil as PencilIcon } from '@phosphor-icons/react/dist/ssr/Pencil';
import { Trash as TrashIcon } from '@phosphor-icons/react/dist/ssr/Trash';
import { Snackbar, Alert, Box } from '@mui/material';
//import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon  } from '@phosphor-icons/react/dist/ssr/Plus';
//import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
import { CompaniesFilters } from '@/components/dashboard/inventory/integrations-filters';
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

interface Inventory {
  id: number;
  stock: number;
  product: Product;
}



export default function Page(): React.JSX.Element {
  const [productToEdit, setProductToEdit] = React.useState<Product | null>(null);
const [openEditProduct, setOpenEditProduct] = React.useState(false);
  const [openCategory, setOpenCategory] = React.useState(false);
  const [openProduct, setOpenProduct] = React.useState(false);
  const [categories, setCategories] = React.useState<Category[]>([]);
  const [products, setProducts] = React.useState<Inventory[]>([]); // Define el tipo para products
  const [searchTerm, setSearchTerm] = React.useState('');
  const [snackbarOpen, setSnackbarOpen] = React.useState(false);
  const [snackbarMessage, setSnackbarMessage] = React.useState('');
  const [snackbarSeverity, setSnackbarSeverity] = React.useState<'success' | 'error'>('success');

  const { control, handleSubmit, reset } = useForm({
    defaultValues: {
      name: '',
      description: '',
      price: '',
      categoryId: '',
      stock: '',
    },
  });
  const filteredProducts = products.filter((inventory) =>
    inventory.product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

const handleOpenCategory = () => {
  setOpenCategory(true);
  reset({ 
    name: '',
    description: '',
  });
};

const handleCloseCategory = () => {
  setOpenCategory(false);
  reset({
    name: '',
    description: '',
  });
};

const handleOpenProduct = () => {
  setOpenProduct(true);
    reset({
      name: '',
      description: '',
      price: '',
      categoryId: '',
      stock: '',
    });
};

const handleCloseProduct = () => {
  setOpenProduct(false);
  reset();
};

const handleOpenEditProduct = (product: Product, inventory: Inventory) => {
  setProductToEdit(product);
  reset({
    name: product.name || '', // Asegúrate de manejar el caso donde product.name pueda ser undefined
    description: product.description || '',
    price: product.price !== undefined ? product.price.toString() : '', // Convertir a string
    stock: inventory.stock !== undefined ? inventory.stock.toString() : '', // Convertir a string
    categoryId: product.category?.id ? product.category.id.toString() : '', // Convertir a string
  });
  setOpenEditProduct(true);
};

const handleCloseEditProduct = () => {
  setOpenEditProduct(false);
  reset();
};

React.useEffect(() => {
  fetchCategories();
  fetchProducts();
}, []);

// Cargar categorías solo del supermercado del usuario
const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('custom-auth-token');
    const user: User = JSON.parse(localStorage.getItem('user') || '{}'); // Obtenemos el usuario
    const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id; // Obtenemos el supermarketId del usuario

    if (!supermarketId) {
      return;
    }

    const response = await fetch(`${API_URL}/categories/supermarket/${supermarketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data: Category[] = await response.json();
      setCategories(data);
    }
  } catch (error) {
    // Manejo de errores omitido
  }
};

// Cargar productos solo del supermercado del usuario
const fetchProducts = async () => {
  try {
    const token = localStorage.getItem('custom-auth-token');
    const user: User = JSON.parse(localStorage.getItem('user') || '{}');
    const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id;

    if (!supermarketId) {
      return;
    }

    const response = await fetch(`${API_URL}/inventory/supermarket/${supermarketId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const data: Inventory[] = await response.json();
      setProducts(data);
      
    }
  } catch (error) {
    // Manejo de errores omitido
  }
};


  

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
        setSnackbarMessage('Categoria creado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Hubo un problema al crear la categoría');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
      } catch (error) {
        setSnackbarMessage('Error al conectar con el servidor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
  };
  
  // Función para añadir producto

  const onSubmitProduct = async (data: {
    name: string;
    description: string;
    price: string; // Cambiar a string porque proviene del formulario
    categoryId: string;
    stock: string; // Cambiar a string porque proviene del formulario
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

      const product: Product = await response.json();

      const inventoryData = {
        productId: product.id,
        supermarketId: Number(supermarketId),
        stock: data.stock ? Number(data.stock) : 1, //se tiene que capturar del inventario
      }
      const responseInventory = await fetch(`${API_URL}/inventory/add-stock`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(inventoryData),
        
      });
  
      if (response.ok && responseInventory.ok) {

        handleCloseProduct();
        fetchProducts();
        setSnackbarMessage('Producto añadido con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
        
      } else {
        setSnackbarMessage('Hubo un problema al crear el producto');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
        
      }
      } catch (error) {
        setSnackbarMessage('Error al conectar con el servidor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
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
        setSnackbarMessage('Producto eliminado con éxito');
        setSnackbarSeverity('success');
        setSnackbarOpen(true);
      } else {
        setSnackbarMessage('Hubo un problema al eliminar producto');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
      } catch (error) {
        setSnackbarMessage('Error al conectar con el servidor');
        setSnackbarSeverity('error');
        setSnackbarOpen(true);
      }
  };

  const onSubmitEditProduct = async (data: {
    name: string;
    description: string;
    price: string;
    categoryId: string;
    stock: string;
    
  }) => {
    if (!productToEdit) return; 
  
    const productData = {
      name: data.name,
      description: data.description,
      price: Number(data.price),
      categoryId: Number(data.categoryId),
    };
    const inventoryData = {
      stock: data.stock ? Number(data.stock) : 1,
    };
  
    try {
      const token = localStorage.getItem('custom-auth-token');
      const user: User = JSON.parse(localStorage.getItem('user') || '{}');
      const supermarketId = user.ownedSupermarket?.id || user.supermarket?.id;
      if (!token) {
        return;
      }

      const response = await fetch(`${API_URL}/products/${productToEdit.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(productData),
      });

      const responseInventory = await fetch(`${API_URL}/inventory/edit-stock/${productToEdit.id}/${supermarketId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(inventoryData),
      });
  
      if (response.ok && responseInventory.ok) {
            handleCloseEditProduct();
            fetchProducts();
            setSnackbarMessage('Producto editado con éxito');
            setSnackbarSeverity('success');
            setSnackbarOpen(true);
        }else {
          setSnackbarMessage('Hubo un problema al editar producto');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
        } catch (error) {
          setSnackbarMessage('Error al conectar con el servidor');
          setSnackbarSeverity('error');
          setSnackbarOpen(true);
        }
};

const handleSnackbarClose = () => {
  setSnackbarOpen(false);
};
  

  return (
<Stack spacing={3}>
  <Grid container spacing={3}>
    <Grid item xs={12} md={8}>
      {/* Título y botones de Importar/Exportar */}
      <Stack spacing={1}>
        <Typography variant="h4">Inventario</Typography>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {/* Aquí puedes añadir otros botones o acciones */}
        </Stack>
      </Stack>
    </Grid>

    <Grid item xs={12} md={4}>
      {/* Botones en columna */}
      <Stack spacing={2}>
        <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenCategory}>
          Añadir Categoria
        </Button>
        <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained" onClick={handleOpenProduct}>
          Añadir Producto
        </Button>
      </Stack>
    </Grid>
  </Grid>

  <CompaniesFilters onSearch={setSearchTerm} />

  {/* Listado de productos */}
  <Stack spacing={2}>
    <Typography variant="h5">Listado de Productos</Typography>
    {products.length === 0 ? (
    <Typography align="center">No hay productos disponibles.</Typography>
  ) : (
    <Grid container spacing={3}>
  {filteredProducts.length > 0 ? (
    filteredProducts.map((inventory) => (
      
      <Grid item xs={12} md={6} lg={4} key={inventory.product.id}>
        <Stack
              spacing={1}
              sx={{
                border: '1px solid #ccc',
                borderRadius: '8px', // Bordes redondeados
                padding: 2,
                minHeight: '300px',
                display: 'flex',
                justifyContent: 'space-between',
                boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)', // Sombra para dar profundidad
                transition: 'transform 0.3s ease', // Efecto de elevación al pasar el ratón
                '&:hover': {
                  transform: 'scale(1.02)', // Zoom ligero al pasar el ratón
                },
                position: 'relative',
              }}
            >

              {/* Cuadro pequeño en la parte superior derecha */}
    <Box 
      sx={{ 
        position: 'absolute', 
    top: 16, // Espaciado desde el borde superior
    right: 16, // Espaciado desde el borde derecho
    border: '1px solid #ccc', 
    padding: 2, // Aumentar el padding para hacer el cuadro más grande
    borderRadius: 1, // Bordes redondeados
    backgroundColor: '#f9f9f9', // Color de fondo del cuadro
    width: '120px', // Ancho fijo del cuadro
    height: '60px', // Altura fija del cuadro, puedes ajustarla según tus necesidades
    display: 'flex', // Usar flexbox para centrar el contenido
    alignItems: 'center', // Centrar verticalmente
    justifyContent: 'center', // Centrar horizontalmente
      }}
    >
  </Box>    
          {/* Nombre del producto truncado en una sola línea */}
          <Typography
            variant="h6"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {inventory.product.name}
          </Typography>

          {/* Descripción con truncado en múltiples líneas */}
          <Typography
            variant="body1"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            
            {inventory.product.description}
          </Typography>

          <Typography variant="body2">Precio: ${inventory.product.price}</Typography>
          <Typography variant="body2">Stock: {inventory.stock}</Typography>
          <Typography
            variant="body2"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            Categoría: {inventory.product.category?.name || 'Categoría no encontrada'}
          </Typography>
          <Button
            variant="outlined"
            color="primary"
            onClick={() => {
               handleOpenEditProduct(inventory.product, inventory)
            }}
            startIcon={<PencilIcon />}
          >
            Editar
          </Button>

          <Button
            variant="outlined"
            color="error"
            onClick={() => handleDeleteProduct(inventory.product.id)}
            startIcon={<TrashIcon />}
          >
            Eliminar
          </Button>
        </Stack>
      </Grid>
    ))
  ) : (
    /* Mensaje cuando no hay productos filtrados disponibles */
    <Grid item xs={12}>
    <Typography align="center">
      No hay productos filtrados disponibles.
    </Typography>
  </Grid>
)}
</Grid>
)}
</Stack>

  {/* Modal para añadir producto */}
  <Dialog open={openProduct} 
  onClose={handleCloseProduct}
  maxWidth="md" // Cambia el ancho máximo, puedes probar con "lg" también
  fullWidth // Esto permite que el modal use el ancho máximo definido
  sx={{ '& .MuiDialog-paper': { width: '400px', maxWidth: '100%' } }} // Personaliza el ancho
  >
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
              inputProps={{ maxLength: 50 }}
              sx={{ marginTop: '5px' }}
            />
          )}
        />

        
        <Controller
        
          name="description"
          control={control}
          render={({ field }) => (
            <TextField {...field}
            label="Descripción"
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 30 }} />
          )}
        />
        <Controller
          name="price"
          control={control}
          rules={{
            required: 'El precio es obligatorio',
            validate: (value) => /^[0-9]*\.?[0-9]{0,2}$/.test(value) || 'Solo se permiten números y hasta dos decimales'
          }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Precio"
              fullWidth
              type="text"
              error={Boolean(fieldState.error)}
              helperText={fieldState.error ? fieldState.error.message : ''}
              inputProps={{
                maxLength: 9, // Limita el número total de caracteres
              }}
              onChange={(e) => {
                const value = e.target.value;
                // Permite solo números y hasta dos decimales
                if (/^[0-9]*\.?[0-9]{0,2}$/.test(value) || value === "") {
                  field.onChange(value); // Solo actualiza el valor si cumple la condición
                }
              }}
            />
          )}
        /> 

          <Controller
            name="stock"
            control={control}
            defaultValue="" // Comienza vacío
            rules={{
              validate: (value) =>
                value === "" || /^[0-9]*\.?[0-9]$/.test(value) || "Solo se permiten números y hasta dos decimales",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Stock"
                fullWidth
                type="text"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error ? fieldState.error.message : ""}
                inputProps={{
                  maxLength: 9, // Limita el número total de caracteres
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números, hasta dos decimales, o vacío
                  if (/^[0-9]*\.?[0-9]$/.test(value) || value === "") {
                    field.onChange(value); // Solo actualiza el valor si cumple la condición
                  }
                }}
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
                {categories.map((category) => (
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
  <Dialog open={openCategory}
   onClose={handleCloseCategory}
   maxWidth="md" // Cambia el ancho máximo, puedes probar con "lg" también
  fullWidth // Esto permite que el modal use el ancho máximo definido
  sx={{ '& .MuiDialog-paper': { width: '400px', maxWidth: '100%' } }} // Personaliza el ancho
   >
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
              inputProps={{ maxLength: 50 }}
              sx={{ marginTop: '5px' }}
            />
          )}
        />
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <TextField {...field} label="Descripción"
            fullWidth
            multiline
            rows={3}
            inputProps={{ maxLength: 200 }}
             />
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

  {/* Modal para editar producto */}
<Dialog open={openEditProduct} 
onClose={handleCloseEditProduct}
  maxWidth="md" // Cambia el ancho máximo, puedes probar con "lg" también
  fullWidth // Esto permite que el modal use el ancho máximo definido
  sx={{ '& .MuiDialog-paper': { width: '400px', maxWidth: '100%' } }}
>
  <DialogTitle>Editar Producto</DialogTitle>
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
            inputProps={{ maxLength: 50 }}
            sx={{ marginTop: '5px' }}
          />
        )}
      />
      <Controller
        name="description"
        control={control}
        render={({ field }) => (
          <TextField {...field}
          label="Descripción"
          fullWidth
          multiline
          rows={3}
          inputProps={{ maxLength: 30 }} />
        )}
      />
      <Controller
        name="price"
        control={control}
        rules={{
          required: 'El precio es obligatorio',
          validate: (value) => /^[0-9]*\.?[0-9]{0,2}$/.test(value) || 'Solo se permiten números y hasta dos decimales'
        }}
        render={({ field, fieldState }) => (
          <TextField
            {...field}
            label="Precio"
            fullWidth
            type="text"
            error={Boolean(fieldState.error)}
            helperText={fieldState.error ? fieldState.error.message : ''}
            inputProps={{
              maxLength: 9,
            }}
            onChange={(e) => {
              const value = e.target.value;
              if (/^[0-9]*\.?[0-9]{0,2}$/.test(value) || value === "") {
                field.onChange(value);
              }
            }}
          />
        )}
      /> 

          <Controller
            name="stock"
            control={control}
            rules={{
              validate: (value) =>
                value === "" || /^[0-9]*\.?[0-9]$/.test(value) || "Solo se permiten números y hasta dos decimales",
            }}
            render={({ field, fieldState }) => (
              <TextField
                {...field}
                label="Stock"
                fullWidth
                type="text"
                error={Boolean(fieldState.error)}
                helperText={fieldState.error ? fieldState.error.message : ""}
                inputProps={{
                  maxLength: 9, // Limita el número total de caracteres
                }}
                onChange={(e) => {
                  const value = e.target.value;
                  // Permitir solo números, hasta dos decimales, o vacío
                  if (/^[0-9]*\.?[0-9]$/.test(value) || value === "") {
                    field.onChange(value); // Solo actualiza el valor si cumple la condición
                  }
                }}
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
              {categories.map((category) => (
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
    <Button onClick={handleCloseEditProduct} color="inherit">
      Cancelar
    </Button>
    <Button onClick={handleSubmit(onSubmitEditProduct)} variant="contained">
      Guardar
    </Button>
  </DialogActions>
</Dialog>

<Snackbar open={snackbarOpen} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
</Stack>
  );
}