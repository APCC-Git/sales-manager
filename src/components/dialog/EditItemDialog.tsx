'use client';

import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Edit } from 'lucide-react';

import { Item } from '@/types/Item';

interface Props {
  item: Item | null;
  onEdit: (editedItem: Item) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClick?: () => void;
}

export const EditItemDialog = ({ item, onEdit, open, onOpenChange, onClick }: Props) => {
  const [price, setPrice] = useState<number>(0);
  const [targetSales, setTargetSales] = useState<number>(0);

  // ダイアログが開かれたときに item の内容で初期化
  useEffect(() => {
    if (item) {
      console.log(item);
      setPrice(item.price);
      setTargetSales(item.targetSales);
    }
  }, [item]);

  const handleSave = () => {
    if (!item) return;
    onEdit({ ...item, price, targetSales });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={'ghost'} size={'icon'} onClick={onClick}>
          <Edit />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>商品情報を編集</DialogTitle>
        </DialogHeader>
        <div className={'w-full flex flex-col gap-4'}>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="item-price-edit">価格</Label>
            <Input
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              id="item-price-edit"
              type="number"
              required
            />
          </div>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="target-sales-edit">売上目標</Label>
            <Input
              value={targetSales}
              onChange={e => setTargetSales(Number(e.target.value))}
              id="target-sales-edit"
              type="number"
              required
            />
          </div>
          <Button className={'w-full bg-blue-500'} onClick={handleSave}>
            保存
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
