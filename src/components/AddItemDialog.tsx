'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

import { Item } from '@/types/Item';

interface Props {
  onAdd: (newItem: Item) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AddItemDialog = ({ onAdd, open, onOpenChange }: Props) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState(200);
  const [targetSales, setTargetSales] = useState(100);

  const handleSubmit = () => {
    if (!name) {
      alert('商品名を入力してください。');
      return;
    }
    const newItem: Item = {
      name,
      price,
      targetSales,
      sold: 0,
    };
    onAdd(newItem);
    setName('');
    setPrice(200);
    setTargetSales(100);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className={'w-full'} variant={'secondary'}>
          <Plus /> 商品を追加
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>商品を追加</DialogTitle>
          <DialogDescription>販売する商品を追加できます。</DialogDescription>
        </DialogHeader>
        <div className={'w-full flex flex-col gap-4'}>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="item-name">名前</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              id="item-name"
              type="text"
              placeholder={'商品名'}
              required
              autoFocus
            />
          </div>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="item-price">価格</Label>
            <Input
              value={price}
              onChange={e => setPrice(Number(e.target.value))}
              id="item-price"
              type="number"
              required
            />
          </div>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="target-sales">売上目標</Label>
            <Input
              value={targetSales}
              onChange={e => setTargetSales(Number(e.target.value))}
              id="target-sales"
              type="number"
              required
            />
          </div>
          <Button className={'w-full bg-blue-500'} onClick={handleSubmit}>
            追加する
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
