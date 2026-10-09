import React from 'react';
import { TransactionItem } from '../types.js';
import { History, ArrowDownRight, ArrowUpRight, Coins, Star } from 'lucide-react';

interface HistoryViewProps {
  transactions: TransactionItem[];
}

export const HistoryView: React.FC<HistoryViewProps> = ({ transactions }) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-24 px-2 animate-fadeIn">
      <div>
        <h2 className="text-xl font-black text-white flex items-center space-x-2">
          <History className="w-5 h-5 text-white/70" />
          <span>ИСТОРИЯ ОПЕРАЦИЙ</span>
        </h2>
        <p className="text-xs text-white/50 font-mono">
          Журнал выпусков карт, начислений Coins и покупок Stars
        </p>
      </div>

      {transactions.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-white/40 bg-white/[0.02] rounded-2xl border border-white/10">
          История операций пуста
        </div>
      ) : (
        <div className="space-y-2.5">
          {transactions.map(tx => {
            const isNegative = tx.amount_coins < 0;
            const isStars = tx.amount_stars > 0;

            return (
              <div
                key={tx.id}
                className="bg-[#10121b] border border-white/5 rounded-2xl p-3 flex items-center justify-between"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      isStars
                        ? 'bg-yellow-400/20 text-yellow-400'
                        : isNegative
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {isStars ? (
                      <Star className="w-4 h-4 fill-current" />
                    ) : isNegative ? (
                      <ArrowDownRight className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <h4 className="font-semibold text-xs text-white">{tx.description}</h4>
                    <span className="text-[10px] font-mono text-white/40">
                      {new Date(tx.created_at).toLocaleString('ru-RU')}
                    </span>
                  </div>
                </div>

                <div className="text-right font-mono font-bold text-xs">
                  {isStars ? (
                    <span className="text-yellow-400">{tx.amount_stars} ⭐</span>
                  ) : tx.amount_coins !== 0 ? (
                    <span className={isNegative ? 'text-red-400' : 'text-emerald-400'}>
                      {tx.amount_coins > 0 ? `+${tx.amount_coins}` : tx.amount_coins}
                    </span>
                  ) : (
                    <span className="text-white/40">0</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
