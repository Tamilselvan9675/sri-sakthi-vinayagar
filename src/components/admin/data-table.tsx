"use client";

import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit, Trash2 } from "lucide-react";
import Link from "next/link";

interface Column<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchKey?: keyof T;
  searchPlaceholder?: string;
  createHref?: string;
  createLabel?: string;
  onDelete?: (item: T) => void;
  editHref?: (item: T) => string;
  onEdit?: (item: T) => void;
}

export function DataTable<T>({
  data,
  columns,
  searchKey,
  searchPlaceholder = "Search...",
  createHref,
  createLabel = "Create New",
  onDelete,
  editHref,
  onEdit,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredData = React.useMemo(() => {
    if (!searchTerm || !searchKey) return data;
    return data.filter((item) => {
      const value = item[searchKey as keyof T];
      if (typeof value === "string") {
        return value.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return false;
    });
  }, [data, searchTerm, searchKey]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        {searchKey ? (
          <div className="relative w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>
        ) : <div />}

        {createHref && (
          <Button render={<Link href={createHref} />}>
            <Plus className="mr-2 h-4 w-4" />
            {createLabel}
          </Button>
        )}
      </div>

      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col, i) => (
              <TableHead key={i}>{col.header}</TableHead>
            ))}
            {(editHref || onEdit || onDelete) && <TableHead className="w-[100px] text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody className="bg-background">
          {filteredData.length > 0 ? (
            filteredData.map((item, i) => (
              <TableRow key={i}>
                {columns.map((col, j) => (
                  <TableCell key={j}>
                    {col.cell ? col.cell(item) : String(item[col.accessorKey as keyof T] || "")}
                  </TableCell>
                ))}
                {(editHref || onEdit || onDelete) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {editHref && (
                        <Button variant="ghost" size="icon" render={<Link href={editHref(item)} />} className="h-8 w-8">
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onEdit(item)}
                          className="h-8 w-8"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                      {onDelete && (
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(item)}
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length + (editHref || onEdit || onDelete ? 1 : 0)} className="h-24 text-center">
                No results found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
