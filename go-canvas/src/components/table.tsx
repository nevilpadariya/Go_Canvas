import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';


const columns: GridColDef[] = [
    { field: 'name', headerName: 'Name', minWidth:100,flex:1},
    { field: 'email', headerName: 'Email', minWidth:200,flex:1},
    { field: 'availableData', headerName: 'Available Data', minWidth:120, flex:1},
    { field: 'downloads', headerName: 'Downloads', minWidth:100, flex:1 },
    { field: 'status', headerName: 'Status', minWidth:100, flex:1,type:'any',cellClassName:'status',
    renderCell:(params: GridRenderCellParams<string>)=>{
        let cssClassName='';
        if(params.value === 'Active'){cssClassName='success';}
        if(params.value === 'Block'){cssClassName='danger';}
        if(params.value === 'Reported'){cssClassName='warning';}
        return(
            <><span className={cssClassName}>{params.value}</span></>
        )
    } },
];

const rows = [
    { id: 1, name: 'John Smith', email: 'John.smith@company.com', availableData: ' 450 MB', downloads: '55 %', status: 'Active'},
    { id: 2, name: 'David Bough', email: 'david.bough@company,com', availableData: ' 457 MB', downloads: '65 %', status: 'Block'},
    { id: 3, name: 'Kevin Archer', email: 'kevin.archer@gmail.com', availableData: ' 231 MB', downloads: '75 %', status: 'Active'},
    { id: 4, name: 'Sara Ovens', email: 'sara.ovens@company.com', availableData: ' 120 MB', downloads: '25 %', status: 'Block'},
    { id: 5, name: 'Ziva Foakes', email: 'ziva.foakes@gmail.com', availableData: ' 552 MB', downloads: '85 %', status: 'Reported'},
    { id: 6, name: 'John Smith', email: 'ziva.foakes@gmail.com', availableData: ' 406 MB', downloads: '58 %', status: 'Active'},
    { id: 7, name: 'John Smith', email: 'david.bough@company,com', availableData: ' 407 MB', downloads: '57 %', status: 'Block'},
    { id: 8, name: 'Kevin Archer', email: 'ziva.foakes@gmail.com', availableData: ' 408 MB', downloads: '51 %', status: 'Reported'},
    { id: 9, name: 'John Smith', email: 'kevin.archer@gmail.com', availableData: ' 409 MB', downloads: '50 %', status: 'Active'},
    { id:10, name: 'Sara Ovens', email: 'ziva.foakes@gmail.com', availableData: ' 411 MB', downloads: '59 %', status: 'Reported'},

];

export default function CustomTable() {
    return (
        <div style={{ height: 310, width: '100%' }}>
            <DataGrid rows={rows}
                columns={columns}
                pageSize={5}
                rowsPerPageOptions={[5,10,15,20,25]}
                headerHeight={48}
                rowHeight={48}
            />
        </div>
    );
}
