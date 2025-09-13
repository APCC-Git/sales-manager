'use client';

import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SettingsDialog } from '@/components/dialog/SettingsDialog';
import { DataUrls } from '@/types/DataUrls';
import { Tickets, ScanQrCode, Minus } from 'lucide-react';
import { Item } from '@/types/Item';
import { SalesData } from '@/types/SalesData';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { AddItemDialog } from '@/components/dialog/AddItemDialog';
import { Separator } from '@/components/ui/separator';
import { EditItemDialog } from '@/components/dialog/EditItemDialog';
import { DeleteItemDialog } from '@/components/dialog/DeleteItemDialog';

import { columns } from '@/components/table/Columns';
import { DataTable } from '@/components/table/DataTable';

interface PredictionData {
  time: string;
  actual?: number;
  predicted?: number;
}

const defaultTime = {
  startHour: 10,
  startMinute: 0,
  endHour: 15,
  endMinute: 0,
};

const CDSalesTracker: React.FC = () => {
  const [targetSales, setTargetSales] = useState<number>(100);
  const [startTime, setStartTime] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState<Date | undefined>(undefined);
  const [currentSales, setCurrentSales] = useState<number>(0);
  const [salesHistory, setSalesHistory] = useState<SalesData[]>([]);

  const [addItemDialogOpen, setAddItemDialogOpen] = useState<boolean>(false);
  const [editItemDialogOpen, setEditItemDialogOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<Item | null>(null);

  const [itemList, setItemList] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataUrls, setDataUrls] = useState<DataUrls>({
    sheetUrl: '',
    sheetName: 'シート1',
    scriptUrl: '',
    scriptToken: '',
  });

  useEffect(() => {
    const now = new Date();
    const start = new Date(now);
    start.setHours(defaultTime.startHour, defaultTime.startMinute, 0, 0); // 10:00 AM
    const end = new Date(now);
    end.setHours(defaultTime.endHour, defaultTime.endMinute, 0, 0); // 3:00 PM

    setStartTime(start);
    setEndTime(end);
  }, []);

  // 設定をローカルストレージから読み込む
  useEffect(() => {
    const SavedItemData = localStorage.getItem('itemList');
    if (!SavedItemData) return;
    const parsedItemData = JSON.parse(SavedItemData);
    onItemListChange(parsedItemData);

    const savedDataUrls = localStorage.getItem('dataUrls');
    if (savedDataUrls) {
      const parsedData = JSON.parse(savedDataUrls);
      setDataUrls(parsedData);
      loadSales(parsedData, parsedItemData);
    }
  }, []);

  // GASから売上読み込み
  const loadSales = async (dataUrls: DataUrls, itemList: Item[]) => {
    setLoading(true);
    const url = `/api/payments?scriptUrl=${encodeURIComponent(dataUrls.scriptUrl)}&scriptToken=${encodeURIComponent(dataUrls.scriptToken)}&sheetUrl=${encodeURIComponent(dataUrls.sheetUrl)}&sheetName=${encodeURIComponent(dataUrls.sheetName)}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
      });
      if (res.ok) {
        const data = await res.json();
        const fetchedSalesData = data.data as SalesData[];
        console.log(data);
        setCurrentSales(fetchedSalesData.length);
        for (let i = 0; i < fetchedSalesData.length; i++) {
          fetchedSalesData[i].totalSales = i + 1;
        }

        const updatedItemList = updateSoldCounts(fetchedSalesData, itemList);
        console.log(updatedItemList);
        onItemListChange(updatedItemList);

        setSalesHistory(fetchedSalesData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // 履歴から itemList の sold を更新する関数
  function updateSoldCounts(sales: SalesData[], items: Item[]): Item[] {
    // 商品ごとの売上数を集計
    const soldCounts = sales.reduce<Record<string, number>>((acc, sale) => {
      acc[sale.name] = (acc[sale.name] || 0) + 1;
      return acc;
    }, {});
    // itemList を更新
    return items.map(item => ({
      ...item,
      sold: soldCounts[`${item.name}`] || 0, // なければ 0
    }));
  }

  const addSale = async (method: 'ticket' | 'auPay', name: string, price: number) => {
    setLoading(true);
    try {
      const newSales = currentSales + 1;
      const now = new Date();
      const newSalesData: SalesData = {
        timestamp: now.toISOString(),
        jst: now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        name,
        totalSales: newSales,
        payment: price,
        method: method,
      };

      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: newSalesData.timestamp,
          jst: newSalesData.jst,
          name: newSalesData.name,
          payment: newSalesData.payment,
          method: newSalesData.method,
          ...dataUrls,
        }),
      });
      if (res.ok) {
        setCurrentSales(newSales);
        setSalesHistory(prev => [...prev, newSalesData]);
        changeSoldCount(name, 1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const removeLastSales = async (name: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          ...dataUrls,
        }),
      });
      if (res.ok) {
        const newSales = currentSales - 1;
        setCurrentSales(newSales);
        setSalesHistory(prev => prev.slice(0, -1));
        changeSoldCount(name, -1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ======== 商品追加/編集/削除/保存 ========
  const addItem = (newItem: Item) => {
    const newItemList = [...itemList, newItem];
    onItemListChange(newItemList);
  };

  const changeSoldCount = (itemName: string, additionalSoldCount: number) => {
    // const newItemList = itemList.map(i =>
    //   i.name === item.name ? { ...i, sold: i.sold + additionalSoldCount } : i
    // );
    // onItemListChange(newItemList);
    const newItemList = itemList.map(item => {
      if (item.name === itemName) {
        return {
          ...item,
          sold: item.sold + additionalSoldCount,
        };
      }
      return item;
    });
    onItemListChange(newItemList);
  };

  const handleEditItem = (edited: Item) => {
    const newItemList = itemList.map(item => (item.name === edited.name ? edited : item));
    onItemListChange(newItemList);
  };

  const handleDeleteItem = (target: Item) => {
    const newItemList = itemList.filter(item => item.name !== target.name);
    onItemListChange(newItemList);
  };

  const onItemListChange = (itemList: Item[]) => {
    setItemList(itemList);
    localStorage.setItem('itemList', JSON.stringify(itemList));
    const totalTargetSales = itemList.reduce((acc, item) => acc + item.targetSales, 0);
    setTargetSales(totalTargetSales);
  };

  const calculatePrediction = (): PredictionData[] => {
    if (salesHistory.length < 1) return [];

    const now = new Date();
    const startHour = startTime ? startTime.getHours() : defaultTime.startHour;
    const startMinute = startTime ? startTime.getMinutes() : defaultTime.startMinute;
    const endHour = endTime ? endTime.getHours() : defaultTime.endHour;
    const endMinute = endTime ? endTime.getMinutes() : defaultTime.endMinute;

    const todayStart = new Date(now);
    todayStart.setHours(startHour, startMinute, 0, 0);

    const todayEnd = new Date(now);
    todayEnd.setHours(endHour, endMinute, 0, 0);

    // 販売時間
    const totalDuration = todayEnd.getTime() - todayStart.getTime(); // ミリ秒
    const hours = Math.ceil(totalDuration / (1000 * 60 * 60)); // 時間の整数値

    // 経過時間
    const elapsedTime = Math.max(0, now.getTime() - todayStart.getTime());

    // 販売開始時間になっていない場合はリターン
    if (elapsedTime <= 0) return [];

    // 現在の売上ペースを計算
    const currentRate = currentSales / (elapsedTime / (1000 * 60 * 60)); // 1時間あたりの売上

    const predictionData: PredictionData[] = [];
    // 1時間ごとにデータを生成
    for (let i = 0; i <= hours; i++) {
      const timePoint = new Date(todayStart.getTime() + i * 60 * 60 * 1000);
      const timeStr = timePoint.toTimeString().slice(0, 5); // 1時間刻みのHH:MM
      // console.log(timePoint, timeStr, todayStart);

      if (timePoint <= now) {
        // console.log(timePoint);
        // 実績データ
        // timePoint から前後30分以内にある salesHistory のデータを１件探す
        const actualData = salesHistory.find(s => {
          return Math.abs(new Date(s.timestamp).getTime() - timePoint.getTime()) < 30 * 60 * 1000;
        });
        // console.log(actualData);
        predictionData.push({
          time: timeStr,
          actual: actualData ? actualData.totalSales : i === 0 ? 0 : undefined,
        });
      } else {
        // 予測データを生成
        const predictedSales = Math.round(currentRate * i);
        predictionData.push({
          time: timeStr,
          predicted: predictedSales,
        });
      }
    }

    // 現在時刻のデータを追加
    const currentTimeStr = now.toTimeString().slice(0, 5);
    const existingCurrentData = predictionData.find(d => d.time === currentTimeStr);
    if (!existingCurrentData) {
      predictionData.push({
        time: currentTimeStr,
        actual: currentSales,
      });
    }

    return predictionData.sort((a, b) => a.time.localeCompare(b.time));
  };

  const predictionData = calculatePrediction();
  const finalPrediction =
    predictionData.length > 0
      ? predictionData[predictionData.length - 1].predicted || currentSales
      : currentSales;

  const achievementRate = targetSales > 0 ? (currentSales / targetSales) * 100 : 0;
  const predictedAchievementRate =
    targetSales > 0 ? ((finalPrediction || 0) / targetSales) * 100 : 0;

  const handleDataUrlsChange = ({ scriptUrl, scriptToken, sheetUrl, sheetName }: DataUrls) => {
    const data = {
      scriptUrl,
      scriptToken,
      sheetUrl,
      sheetName,
    };
    localStorage.setItem('dataUrls', JSON.stringify(data));
    setDataUrls(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 w-full font-noto">
      <div className="max-w-full mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側 */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className={'flex justify-center gap-3'}>
            {/*商品追加ボタン*/}
            <div className={'w-full'}>
              <AddItemDialog
                onAdd={addItem}
                open={addItemDialogOpen}
                onOpenChange={setAddItemDialogOpen}
              />
            </div>
            {/* 設定ボタン */}
            <div className={'w-full'}>
              <SettingsDialog
                dataUrls={dataUrls}
                setDataUrls={handleDataUrlsChange}
                startTime={startTime}
                setStartTime={setStartTime}
                endTime={endTime}
                setEndTime={setEndTime}
              />
            </div>
          </div>
          <Separator />
          {/*商品リスト*/}
          {itemList.length > 0 ? (
            itemList.map((item, i) => (
              <Card key={i} className={'shadow-none min-h-48'}>
                <CardHeader>
                  <CardTitle className={'text-xl'}>{item.name}</CardTitle>
                  <CardDescription>
                    ￥{item.price} ・ 売上目標{item.targetSales}個
                  </CardDescription>
                  <CardAction className={'flex items-center justify-center gap-1 text-lg'}>
                    <div>
                      <EditItemDialog
                        onEdit={handleEditItem}
                        open={editItemDialogOpen}
                        onOpenChange={setEditItemDialogOpen}
                        item={editingItem}
                        onClick={() => setEditingItem(item)}
                      />
                    </div>
                    <div>
                      <DeleteItemDialog
                        open={deleteDialogOpen}
                        onOpenChange={setDeleteDialogOpen}
                        item={deletingItem}
                        onDelete={handleDeleteItem}
                        onClick={() => setDeletingItem(item)}
                      />
                    </div>
                  </CardAction>
                </CardHeader>
                <CardContent>
                  <div className={'w-full flex items-center justify-between'}>
                    <div>
                      <span className={'text-blue-500 text-5xl font-bold'}>{item.sold}</span>
                      <span className={'text-gray-500 text-lg'}>/ {item.targetSales} 個</span>
                    </div>
                    <div className="flex justify-center items-center gap-4 flex-wrap">
                      <button
                        onClick={() => addSale('ticket', item.name, item.price)}
                        disabled={loading}
                        className={`flex gap-2 items-center justify-center text-3xl font-bold h-16 px-5 rounded-full transition-all transform hover:scale-105 ${
                          !loading
                            ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Tickets size={30} /> 売上
                      </button>
                      <button
                        onClick={() => addSale('auPay', item.name, item.price)}
                        disabled={loading}
                        className={`flex gap-2 items-center justify-center text-3xl font-bold h-16 px-5 rounded-full transition-all transform hover:scale-105 ${
                          !loading
                            ? 'bg-[#EB5505] hover:bg-[#bf4402] text-white shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <ScanQrCode size={30} /> 売上
                      </button>
                      <button
                        onClick={() => removeLastSales(item.name)}
                        disabled={currentSales === 0 || loading}
                        className={`text-3xl font-bold flex justify-center items-center h-16 w-16 rounded-full transition-all transform hover:scale-105 ${
                          currentSales > 0 && !loading
                            ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <Minus />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className={'shadow-none min-h-48 flex items-center justify-center'}>
              <CardContent className={'w-full  h-full flex items-center justify-center'}>
                <p className={'text-muted-foreground text-center'}>
                  商品がまだ追加されていません。
                  <br />
                  左上の&nbsp;<span className={'bg-secondary p-1 rounded-md'}>+ 商品を追加</span>
                  &nbsp; から追加してください。
                </p>
              </CardContent>
            </Card>
          )}
          <Separator />
          <DataTable columns={columns} data={salesHistory} />
        </div>

        {/* 右側 */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          <div className="bg-blue-50 rounded-lg p-6 mb-4 text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">現在の売上</h2>
            <div className="text-6xl font-bold text-blue-600 mb-4">{currentSales}</div>
            <div className="text-lg text-gray-600">/ {targetSales} 個</div>
            <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
              <div
                className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(achievementRate, 100)}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-600 mt-2">達成率: {achievementRate.toFixed(1)}%</div>
          </div>
          <Separator />
          <h3 className="text-lg font-bold text-gray-800 mb-4">売上推移グラフ</h3>
          {predictionData.length > 0 ? (
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={predictionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip formatter={(value: number, name: string) => [`${value}枚`, name]} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="actual"
                  stroke="#2563eb"
                  strokeWidth={3}
                  name="実績"
                  connectNulls={true}
                />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="予測"
                  connectNulls={true}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[75vh] text-gray-400">
              <div className="text-center">
                <div className="text-6xl mb-4">📊</div>
                <p>販売開始後にグラフが表示されます</p>
              </div>
            </div>
          )}
          {/* 予測表示 */}
          <div className="bg-yellow-50 rounded-lg p-4">
            <h3 className="text-lg font-bold text-yellow-800 mb-2">📈 売上予測</h3>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <span className="text-yellow-700">最終予測売上:</span>
                <span className="font-bold text-xl ml-2">{finalPrediction}枚</span>
              </div>
              <div>
                <span className="text-yellow-700">予測達成率:</span>
                <span className="font-bold text-xl ml-2">
                  {predictedAchievementRate.toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CDSalesTracker;
