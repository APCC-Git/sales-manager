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
import { SettingsDialog } from '@/components/SettingsDialog';
import { DataUrls } from '@/types/DataUrls';
import { Tickets, ScanQrCode } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { TimePicker } from '@/components/ui/datatime-picker';

interface SalesData {
  timestamp: string;
  jst: string;
  totalSales: number;
  payment: number;
  method: string;
}

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
  const [price, setPrice] = useState<number>(200);
  const [salesHistory, setSalesHistory] = useState<SalesData[]>([]);
  const [isActive, setIsActive] = useState<boolean>(true);
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
    const data = localStorage.getItem('dataUrls');
    if (data) {
      const parsedData = JSON.parse(data);
      setDataUrls(parsedData);
      loadSales(parsedData);
    }
  }, []);

  // 売上読み込み
  const loadSales = async (dataUrls: DataUrls) => {
    setLoading(true);
    const url = `/api/payments?scriptUrl=${encodeURIComponent(dataUrls.scriptUrl)}&scriptToken=${encodeURIComponent(dataUrls.scriptToken)}&sheetUrl=${encodeURIComponent(dataUrls.sheetUrl)}&sheetName=${encodeURIComponent(dataUrls.sheetName)}`;
    try {
      const res = await fetch(url, {
        method: 'GET',
      });
      if (res.ok) {
        const data = await res.json();
        // console.log(data);
        setCurrentSales(data.length);
        for (let i = 0; i < data.length; i++) {
          data[i].totalSales = i + 1;
        }
        setSalesHistory(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addSale = async (method: 'ticket' | 'auPay') => {
    setLoading(true);
    try {
      const newSales = currentSales + 1;
      const now = new Date();
      const newSalesData: SalesData = {
        timestamp: now.toISOString(),
        jst: now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
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
          payment: newSalesData.payment,
          method: newSalesData.method,
          ...dataUrls,
        }),
      });
      if (res.ok) {
        setCurrentSales(newSales);
        setSalesHistory(prev => [...prev, newSalesData]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const resetSales = () => {
    setCurrentSales(0);
    setSalesHistory([]);
  };

  const removeLastSales = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/payments', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...dataUrls,
        }),
      });
      if (res.ok) {
        const newSales = currentSales - 1;
        setCurrentSales(newSales);

        setSalesHistory(prev => prev.slice(0, -1));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const startTracking = () => {
    const now = new Date();
    setIsActive(true);
    setSalesHistory([
      {
        timestamp: now.toISOString(),
        jst: now.toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' }),
        totalSales: currentSales,
        payment: price,
        method: 'ticket',
      },
    ]);
  };

  const stopTracking = () => {
    setIsActive(false);
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
  // console.log(predictionData);
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
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 左側: コントロールパネル */}
        <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
          {/* 売上カウンター */}
          <SettingsDialog dataUrls={dataUrls} setDataUrls={handleDataUrlsChange} />

          <div className="text-center mb-8">
            <div className="bg-blue-50 rounded-lg p-6 mb-4">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">現在の売上</h2>
              <div className="text-6xl font-bold text-blue-600 mb-4">{currentSales}</div>
              <div className="text-lg text-gray-600">/ {targetSales} 枚</div>
              <div className="w-full bg-gray-200 rounded-full h-4 mt-4">
                <div
                  className="bg-blue-600 h-4 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min(achievementRate, 100)}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">
                達成率: {achievementRate.toFixed(1)}%
              </div>
            </div>

            <div className="flex justify-center gap-4 flex-wrap">
              <button
                onClick={removeLastSales}
                disabled={!isActive || currentSales === 0 || loading}
                className={`text-3xl font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 ${
                  isActive && currentSales > 0 && !loading
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                − 取消
              </button>
              <button
                onClick={() => addSale('ticket')}
                disabled={!isActive || loading}
                className={`flex gap-2 items-center justify-center text-3xl font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 ${
                  isActive && !loading
                    ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Tickets size={30} /> 売上
              </button>
              <button
                onClick={() => addSale('auPay')}
                disabled={!isActive || loading}
                className={`flex gap-2 items-center justify-center text-3xl font-bold py-4 px-8 rounded-full transition-all transform hover:scale-105 ${
                  isActive && !loading
                    ? 'bg-[#EB5505] hover:bg-[#bf4402] text-white shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ScanQrCode size={30} /> 売上
              </button>
            </div>
          </div>

          {/* 設定パネル */}
          <div className="grid grid-cols-1 gap-4 mb-6">
            <div>
              <Label
                htmlFor={'target-sales'}
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                目標売上個数
              </Label>
              <Input
                id={'target-sales'}
                type="number"
                value={targetSales}
                onChange={e => setTargetSales(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div>
              <Label htmlFor={'price'} className="block text-sm font-medium text-gray-700 mb-2">
                商品の価格
              </Label>
              <Input
                id={'price'}
                type="number"
                value={price}
                onChange={e => setPrice(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">開始時間</div>
                <div className={'max-w-full'}>
                  <TimePicker date={startTime} onChange={setStartTime} granularity={'minute'} />
                </div>
              </div>
              <div>
                <div className="block text-sm font-medium text-gray-700 mb-2">終了時間</div>
                <div className={'max-w-full'}>
                  <TimePicker date={endTime} onChange={setEndTime} granularity={'minute'} />
                </div>
              </div>
            </div>
          </div>

          {/* コントロールボタン */}
          {/*<div className="flex justify-center gap-4 mb-6">*/}
          {/*  {!isActive ? (*/}
          {/*    <button*/}
          {/*      onClick={startTracking}*/}
          {/*      className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"*/}
          {/*    >*/}
          {/*      📊 販売開始*/}
          {/*    </button>*/}
          {/*  ) : (*/}
          {/*    <button*/}
          {/*      onClick={stopTracking}*/}
          {/*      className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"*/}
          {/*    >*/}
          {/*      ⏹️ 販売終了*/}
          {/*    </button>*/}
          {/*  )}*/}
          {/*  <button*/}
          {/*    onClick={resetSales}*/}
          {/*    className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"*/}
          {/*  >*/}
          {/*    🔄 リセット*/}
          {/*  </button>*/}
          {/*</div>*/}
        </div>

        {/* 右側: グラフ */}
        <div className="bg-white rounded-lg shadow-lg p-6 min-h-[76vh]">
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
