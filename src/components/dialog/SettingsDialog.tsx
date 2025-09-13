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
import { Separator } from '@/components/ui/separator';
import { Settings } from 'lucide-react';

import { DataUrls } from '@/types/DataUrls';
import { TimePicker } from '@/components/ui/datatime-picker';
import React from 'react';
import { SeparatorWithText } from '@/components/SeparatorWithText';

interface Props {
  dataUrls: DataUrls;
  setDataUrls: (dataUrls: DataUrls) => void;
  startTime: Date | undefined;
  endTime: Date | undefined;
  setStartTime: (date: Date | undefined) => void;
  setEndTime: (date: Date | undefined) => void;
}

export const SettingsDialog = ({
  dataUrls,
  setDataUrls,
  startTime,
  endTime,
  setStartTime,
  setEndTime,
}: Props) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className={'w-full'} variant={'secondary'}>
          <Settings /> 設定を開く
        </Button>
      </DialogTrigger>
      <DialogContent className={'max-h-screen overflow-y-auto'}>
        <DialogHeader>
          <DialogTitle>設定</DialogTitle>
          <DialogDescription>設定は自動的に保存されます。</DialogDescription>
        </DialogHeader>
        <div className={'w-full flex flex-col gap-4'}>
          <SeparatorWithText text={'販売時間設定'} />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">販売開始時間</div>
              <div className={'max-w-full'}>
                <TimePicker
                  date={startTime}
                  onChange={setStartTime}
                  id={'start-time'}
                  granularity={'minute'}
                />
              </div>
            </div>
            <div>
              <div className="block text-sm font-medium text-gray-700 mb-2">販売終了時間</div>
              <div className={'max-w-full'}>
                <TimePicker
                  date={endTime}
                  onChange={setEndTime}
                  id={'end-time'}
                  granularity={'minute'}
                />
              </div>
            </div>
          </div>
          <SeparatorWithText text={'スプレッドシート設定'} />
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="spreadsheet-url">スプレッドシートのURL</Label>
            <Input
              value={dataUrls.sheetUrl}
              onChange={e => setDataUrls({ ...dataUrls, sheetUrl: e.target.value })}
              id="spreadsheet-url"
              type="url"
              placeholder={'https://docs.google.com/spreadsheets/...'}
            />
          </div>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="spreadsheet-url">スプレッドシートのシート名</Label>
            <Input
              value={dataUrls.sheetName}
              onChange={e => setDataUrls({ ...dataUrls, sheetName: e.target.value })}
              id="spreadsheet-name"
              type="text"
              placeholder={'シート1'}
            />
          </div>
          <SeparatorWithText text={'GAS設定'} />
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="script-url">Google Apps ScriptのURL</Label>
            <Input
              value={dataUrls.scriptUrl}
              onChange={e => setDataUrls({ ...dataUrls, scriptUrl: e.target.value })}
              id="script-url"
              type="url"
              placeholder={'https://script.google.com/.../exec'}
            />
          </div>
          <div className={'flex flex-col gap-2'}>
            <Label htmlFor="script-token">Google Apps ScriptのSECRET_KEY</Label>
            <Input
              value={dataUrls.scriptToken}
              onChange={e => setDataUrls({ ...dataUrls, scriptToken: e.target.value })}
              id="script-token"
              type="text"
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
