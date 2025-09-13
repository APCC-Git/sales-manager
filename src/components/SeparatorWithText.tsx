import { Separator } from '@/components/ui/separator';

export const SeparatorWithText = ({ text }: { text: string }) => {
  return (
    <div className="flex items-center gap-4">
      <Separator className="flex-1" />
      <span className="text-muted-foreground">{text}</span>
      <Separator className="flex-1" />
    </div>
  );
};
