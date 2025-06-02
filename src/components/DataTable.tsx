
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface DataItem {
  id: number;
  name: string;
  description: string;
  status: string;
  date: string;
}

interface DataTableProps {
  currentCount: number;
}

const DataTable: React.FC<DataTableProps> = ({ currentCount }) => {
  const dummyData: DataItem[] = [
    {
      id: 1,
      name: "Item 1",
      description: "Description 1",
      status: "Active",
      date: "2024-06-01"
    },
    {
      id: 2,
      name: "Item 2",
      description: "Description 2",
      status: "Pending",
      date: "2024-06-02"
    },
    {
      id: 3,
      name: "Item 3",
      description: "Description 3",
      status: "Completed",
      date: "2024-06-03"
    },
    {
      id: 4,
      name: "Item 4",
      description: "Description 4",
      status: "Active",
      date: "2024-06-04"
    },
    {
      id: 5,
      name: "Item 5",
      description: "Description 5",
      status: "Inactive",
      date: "2024-06-05"
    }
  ];

  return (
    <div className="w-full bg-white border-2 border-black">
      <div className="p-6 border-b-2 border-black text-center">
        <span className="text-2xl font-bold text-black">{currentCount}</span>
      </div>
      <div className="border-2 border-black">
        <Table>
          <TableHeader>
            <TableRow className="border-b-2 border-black">
              <TableHead className="text-black border-r-2 border-black text-center font-bold">ID</TableHead>
              <TableHead className="text-black border-r-2 border-black text-center font-bold">Name</TableHead>
              <TableHead className="text-black border-r-2 border-black text-center font-bold">Description</TableHead>
              <TableHead className="text-black border-r-2 border-black text-center font-bold">Status</TableHead>
              <TableHead className="text-black text-center font-bold">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dummyData.map((item) => (
              <TableRow key={item.id} className="border-b-2 border-black">
                <TableCell className="text-black border-r-2 border-black text-center">{item.id}</TableCell>
                <TableCell className="text-black border-r-2 border-black text-center">{item.name}</TableCell>
                <TableCell className="text-black border-r-2 border-black text-center">{item.description}</TableCell>
                <TableCell className="text-black border-r-2 border-black text-center">{item.status}</TableCell>
                <TableCell className="text-black text-center">{item.date}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default DataTable;
