import * as React from 'react';
import type { Metadata } from 'next';
// import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
// import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
// import Grid from '@mui/material/Unstable_Grid2';
import { Download as DownloadIcon } from '@phosphor-icons/react/dist/ssr/Download';
import { Plus as PlusIcon } from '@phosphor-icons/react/dist/ssr/Plus';
import { Upload as UploadIcon } from '@phosphor-icons/react/dist/ssr/Upload';
// import dayjs from 'dayjs';

import { config } from '@/config';
// import { IntegrationCard } from '@/components/dashboard/integrations/integrations-card';
// import type { Integration } from '@/components/dashboard/integrations/integrations-card';
import { CompaniesFilters } from '@/components/dashboard/integrations/integrations-filters';

export const metadata: Metadata = { title: config.site.name }; 


export default function Page(): React.JSX.Element {
  return (
    <Stack spacing={3}>
      <Stack direction="row" spacing={3}>
        <Stack spacing={1} sx={{ flex: '1 1 auto' }}>
          <Typography variant="h4">Inventario</Typography>
          <Stack sx={{ alignItems: 'center' }} direction="row" spacing={1}>
            <Button color="inherit" startIcon={<UploadIcon fontSize="var(--icon-fontSize-md)" />}>
              Importar
            </Button>
            <Button color="inherit" startIcon={<DownloadIcon fontSize="var(--icon-fontSize-md)" />}>
              Exportar
            </Button>
          </Stack>
        </Stack>
        <div>
          <Button startIcon={<PlusIcon fontSize="var(--icon-fontSize-md)" />} variant="contained">
            Añadir
          </Button>
        </div>
      </Stack>
      <CompaniesFilters />
    </Stack>
  );
}
