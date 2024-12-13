import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
  MoreHorizontal,
  EditIcon,
  Trash2Icon,
  LinkIcon,
  FilesIcon,
  Download,
} from 'lucide-react';

import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import useAxiosPrivate from '../../hooks/useAxiosPrivate';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '../ui/AlertDialog';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ResponsesDialog from './ResponsesDialog';
import axios from 'axios';

export default function DataTableRowActions({ formId }: { formId: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const queryClient = useQueryClient();
  const axiosPrivate = useAxiosPrivate();
  const { mutate, isPending } = useMutation({
    mutationFn: () => axiosPrivate.delete('/forms/' + formId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['forms'],
      });
      toast.success('Form deleted successfully');
    },
    onError: () => toast.error('Error deleting form'),
  });

  const exportToCSV = async (formId: any) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/v1/forms/${formId}/csv`,
        {
          responseType: 'blob',
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'submissions.csv');
      document.body.appendChild(link);
      link.click();
    } catch (error) {
      console.error('Failed to export submissions', error);
    }
  };

  return (
    <DropdownMenu modal={false} open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-8 w-8 p-0 data-[state=open]:bg-gray-700"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[160px] bg-black text-white border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel className="text-gray-400">Actions</DropdownMenuLabel>
        <DropdownMenuItem
          className="flex items-center gap-2 hover:bg-gray-700 focus:bg-gray-700"
          onClick={() =>
            window.open(window.location.origin + '/forms/' + formId, '_blank')
          }
        >
          <LinkIcon className="w-4 h-4 text-gray-400" />
          <span>Open Form Link</span>
        </DropdownMenuItem>
        <ResponsesDialog formId={formId} closeHandler={() => setOpen(false)}>
          <DropdownMenuItem
            className="flex items-center gap-2 hover:bg-gray-700 focus:bg-gray-700"
            onSelect={(e) => e.preventDefault()}
          >
            <FilesIcon className="w-4 h-4 text-gray-400" />
            <span>Show Responses</span>
          </DropdownMenuItem>
        </ResponsesDialog>
        <DropdownMenuItem
          className="flex items-center gap-2 hover:bg-gray-700 focus:bg-gray-700"
          onClick={() => navigate(formId + '/edit')}
        >
          <EditIcon className="w-4 h-4 text-gray-400" />
          <span>Edit</span>
        </DropdownMenuItem>
        <AlertDialog
          onOpenChange={(open) => {
            if (!open) setOpen(false);
          }}
        >
          <AlertDialogTrigger asChild>
            <DropdownMenuItem
              className="flex items-center gap-2 hover:bg-gray-700 focus:bg-gray-700"
              onSelect={(e) => e.preventDefault()}
            >
              <Trash2Icon className="w-4 h-4 text-gray-400" />
              <span>Delete</span>
            </DropdownMenuItem>
          </AlertDialogTrigger>
          <AlertDialogContent className="text-white bg-black border border-gray-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                Are you absolutely sure?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-gray-400">
                This action cannot be undone. This will permanently delete your
                data and remove your data from our servers.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="sm:space-x-4">
              <Button
                variant="destructive"
                isLoading={isPending}
                onClick={() => {
                  mutate();
                }}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-800"
              >
                Yes, delete form
              </Button>
              <AlertDialogCancel
                disabled={isPending}
                className="text-gray-400 hover:text-white focus:ring-gray-600"
              >
                Cancel
              </AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <DropdownMenuItem
          className="flex items-center gap-2 hover:bg-gray-700 focus:bg-gray-700"
          onClick={() => exportToCSV(formId)}
        >
          <Download className="w-4 h-4 text-gray-400" />
          <span>Export To CSV</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
