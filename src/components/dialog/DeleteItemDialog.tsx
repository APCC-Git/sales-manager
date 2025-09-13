import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react';

import { Item } from '@/types/Item';

interface DeleteItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: Item | null; // 削除対象
  onDelete: (item: Item) => void;
  onClick?: () => void;
}

export const DeleteItemDialog = ({
  open,
  onOpenChange,
  item,
  onDelete,
  onClick,
}: DeleteItemDialogProps) => {
  const handleDelete = () => {
    if (!item) return;
    onDelete(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'} onClick={onClick}>
          <Trash color={'var(--color-red-500)'} />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className={'text-red-500'}>商品を削除</DialogTitle>
        </DialogHeader>
        <div className={'w-full flex flex-col gap-4'}>
          <div className={'flex flex-col gap-2 text-center'}>
            <p>
              「{item?.name}」 を削除しますか？
              <br /> スプレッドシートからは削除されません。
            </p>
          </div>
          <Button className={'w-full bg-red-500'} onClick={handleDelete}>
            削除する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
