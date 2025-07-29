import * as React from 'react';
import {
  Chip,
  Button,
  Paper,
} from '@mui/material';
import { 
  DataGrid, 
  GridColDef, 
} from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import { mockRequestData } from '../../data/mock-requestData';
import { useAuth } from '../../hooks/useAuth';

interface RequestsTableProps {
  data?: typeof mockRequestData;
  userId?: string; // If provided, will filter requests for this specific user (APPROVERs only)
  showUserColumn?: boolean; // Whether to show the User ID column
}

// Transform Product data to RequestData format
const getStatusColor = (status: string): 'warning' | 'success' | 'error' | 'default' => {
  switch (status) {
    case 'Pending':
      return 'warning';
    case 'Approved':
      return 'success';
    case 'Denied':
      return 'error';
    default:
      return 'default';
  }
};

export const RequestsTable: React.FC<RequestsTableProps> = ({ 
  data, 
  userId, 
  showUserColumn = true 
}) => {
  const navigate = useNavigate();
  const { isApprover, isRequestor, getUserInfo } = useAuth();
  const userInfo = getUserInfo();
  
  // Determine which user's requests to show based on role
  const effectiveUserId = React.useMemo(() => {
    // If userId is provided (from URL), use it regardless of auth status for development
    if (userId) {
      return userId;
    }
    
    // If no authentication is available, show all requests
    if (!userInfo) {
      return undefined; // Show all requests
    }
    
    // If user is an approver, they can see all requests or filter by specific user
    if (isApprover()) {
      return undefined; // undefined = all requests
    }
    
    // If user is a requestor, they can only see their own requests
    if (isRequestor()) {
      return userInfo?.username; // Always their own requests
    }
    
    // Default fallback - show all requests
    return undefined;
  }, [userId, isApprover, isRequestor, userInfo]);
  
  // Use provided data or default mock data, filtered by effectiveUserId if specified
  const allRequests = data || mockRequestData;
  const requests = effectiveUserId 
    ? allRequests.filter(request => {
        // Extract the user ID part from the email (before the @)
        const emailUserId = request.personalData.email.split('@')[0];
        return emailUserId.toLowerCase() === effectiveUserId.toLowerCase();
      })
    : allRequests;
  
  // Convert to format expected by DataGrid
  const tableData = requests.map(request => ({
    id: request.requestId,
    ticketNumber: request.ticketNumber,
    userId: request.personalData.name,
    userEmail: request.personalData.email,
    ticketType: 'Application', // Default since this isn't in the new structure
    asset: request.cartItems.map(item => item.productName).join(', '),
    qtySize: request.summary.totalQuantity,
    estimatedPrice: request.summary.estimatedROM,
    dateCreated: new Date(request.submittedAt).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short',
      year: '2-digit'
    }),
    lastUpdated: new Date(request.submittedAt).toLocaleDateString('en-US', {
      day: '2-digit',
      month: 'short', 
      year: '2-digit'
    }),
    status: request.status,
  }));

  const handleViewClick = (requestId: string): void => {
    // Preserve the userId in the URL when navigating to request detail
    const url = effectiveUserId 
      ? `/request-detail?id=${requestId}&userId=${effectiveUserId}`
      : `/request-detail?id=${requestId}`;
    navigate(url);
  };

  // Define columns for DataGrid with basic filtering
  const getColumns = (): GridColDef[] => {
    const baseColumns: GridColDef[] = [
      {
        field: 'ticketNumber',
        headerName: 'Ticket #',
        width: 90,
        filterable: true,
      },
    ];

    // Conditionally add User ID column - only for APPROVERs
    if (showUserColumn && (isApprover() || !userInfo)) {
      baseColumns.push({
        field: 'userId',
        headerName: 'User ID',
        width: 120,
        filterable: true,
      });
    }

    // Add remaining columns
    baseColumns.push(
      {
        field: 'ticketType',
        headerName: 'Ticket Type',
        width: 90,
        filterable: true,
        type: 'singleSelect',
        valueOptions: ['Application', 'Hardware', 'Software', 'Access'],
      },
      {
        field: 'asset',
        headerName: 'Asset',
        width: 180,
        filterable: true,
        flex: 1, // This will take up remaining space
      },
      {
        field: 'qtySize',
        headerName: 'Qty',
        width: 70,
        filterable: true,
      },
      {
        field: 'estimatedPrice',
        headerName: 'Estimated Price',
        width: 100,
        filterable: true,
      },
      {
        field: 'dateCreated',
        headerName: 'Date Created',
        width: 100,
        filterable: true,
      },
      {
        field: 'lastUpdated',
        headerName: 'Last Updated',
        width: 100,
        filterable: true,
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 100,
        filterable: true,
        type: 'singleSelect',
        valueOptions: ['Pending', 'Approved', 'Denied'],
        renderCell: (params) => (
          <Chip
            label={params.value}
            color={getStatusColor(params.value as string)}
            size="small"
          />
        ),
      },
      {
        field: 'actions',
        headerName: 'Actions',
        width: 90,
        filterable: false,
        sortable: false,
        renderCell: (params) => (
          <Button
            variant="text"
            color="primary"
            size="small"
            onClick={() => handleViewClick(params.row.id)}
          >
            View
          </Button>
        ),
      }
    );

    return baseColumns;
  };

  return (
    <div style={{ height: 700, width: '100%' }}>
      <Paper sx={{ height: 700, width: '100%' }}>
        <DataGrid
          rows={tableData}
          columns={getColumns()}
          slotProps={{
            toolbar: {
              showQuickFilter: true,
              quickFilterProps: { debounceMs: 500 },
            },
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[5, 10, 25, 50]}
          checkboxSelection={false}
          disableRowSelectionOnClick
          hideFooterSelectedRowCount
          disableColumnResize={false}
          autoHeight={false}
          sx={{
            '& .MuiDataGrid-footerContainer': {
              marginTop: 0,
              paddingTop: '8px',
              minHeight: '52px',
            },
            '& .MuiDataGrid-virtualScrollerContent': {
              marginBottom: 0,
            }
          }}
        />
      </Paper>
    </div>
  );
};