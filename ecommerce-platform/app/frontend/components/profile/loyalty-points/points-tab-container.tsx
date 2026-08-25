"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  LoyaltyPointsSummary,
  PointsConfig,
  PointsLedgerItem,
  PointsTransactionType,
} from "../../../types/points.types";
import { PointsBalanceHeroCard } from "./points-balance-hero-card";
import { PointsRuleGuideCard } from "./points-rule-guide-card";
import { PointsHistoryFilter } from "./points-history-filter";
import { PointsHistoryTable } from "./points-history-table";
import { PointsHistoryPagination } from "./points-history-pagination";
import {
  getPointsSummaryApi,
  getPointsHistoryApi,
  getPointsConfigApi,
} from "../../../lib/points";
import { useAuthStore } from "../../../store/use-auth-store";

const DEFAULT_CONFIG: PointsConfig = {
  earnRatePercentage: 1,
  redeemRateVnd: 1000,
  minPointsToRedeem: 10,
  maxRedeemPercentage: 100,
  pointsExpiryDays: 0,
};

export const PointsTabContainer: React.FC = () => {
  const [summary, setSummary] = useState<LoyaltyPointsSummary | null>(null);
  const [config, setConfig] = useState<PointsConfig>(DEFAULT_CONFIG);
  const [historyItems, setHistoryItems] = useState<PointsLedgerItem[]>([]);
  const [paginationMeta, setPaginationMeta] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const [currentFilter, setCurrentFilter] = useState<
    PointsTransactionType | "ALL"
  >("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [showGuide, setShowGuide] = useState(false);

  // 3 Trạng thái
  const [isLoadingSummary, setIsLoadingSummary] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 1. Tải thông tin tổng quan & cấu hình điểm
  const loadSummaryAndConfig = useCallback(async () => {
    setIsLoadingSummary(true);
    setErrorMessage(null);
    try {
      const [summaryRes, configRes] = await Promise.allSettled([
        getPointsSummaryApi(),
        getPointsConfigApi(),
      ]);

      if (summaryRes.status === "fulfilled") {
        setSummary(summaryRes.value);
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          useAuthStore.getState().setUser({
            ...currentUser,
            loyaltyPoints: summaryRes.value.currentPoints,
            membershipTier: summaryRes.value.membershipTier,
          });
        }
      } else {
        throw new Error(summaryRes.reason?.message || "Không thể tải tổng quan điểm");
      }

      if (configRes.status === "fulfilled") {
        setConfig(configRes.value);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Đã xảy ra lỗi khi kết nối máy chủ");
    } finally {
      setIsLoadingSummary(false);
    }
  }, []);

  // 2. Tải lịch sử biến động điểm
  const loadHistory = useCallback(async () => {
    setIsLoadingHistory(true);
    try {
      const historyRes = await getPointsHistoryApi({
        page: currentPage,
        limit: 8,
        type: currentFilter,
      });
      setHistoryItems(historyRes.items || []);
      setPaginationMeta(
        historyRes.meta || {
          page: currentPage,
          limit: 8,
          total: 0,
          totalPages: 1,
        }
      );
    } catch (err: any) {
      console.error("Lỗi khi tải lịch sử điểm:", err);
    } finally {
      setIsLoadingHistory(false);
    }
  }, [currentPage, currentFilter]);

  useEffect(() => {
    loadSummaryAndConfig();
  }, [loadSummaryAndConfig]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleFilterChange = (filter: PointsTransactionType | "ALL") => {
    setCurrentFilter(filter);
    setCurrentPage(1);
  };

  // --- 1. Loading Skeleton State ---
  if (isLoadingSummary && !summary) {
    return (
      <div className="space-y-6 animate-pulse">
        {/* Hero Bento Skeleton */}
        <div className="bg-gradient-to-r from-slate-200 to-slate-100 rounded-3xl h-64 w-full" />

        {/* History Card Skeleton */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 space-y-4">
          <div className="h-6 bg-slate-200 rounded w-1/4" />
          <div className="h-4 bg-slate-100 rounded w-1/2" />
          <div className="space-y-3 pt-4">
            <div className="h-16 bg-slate-50 rounded-xl" />
            <div className="h-16 bg-slate-50 rounded-xl" />
            <div className="h-16 bg-slate-50 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // --- 2. Error State ---
  if (errorMessage && !summary) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-red-100 text-center space-y-4">
        <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto text-2xl">
          ⚠️
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">
            Không thể tải thông tin điểm tích lũy
          </h3>
          <p className="text-sm text-slate-500">{errorMessage}</p>
        </div>
        <button
          onClick={loadSummaryAndConfig}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Thử lại
        </button>
      </div>
    );
  }

  const fallbackSummary: LoyaltyPointsSummary = summary || {
    currentPoints: 0,
    equivalentVnd: 0,
    membershipTier: "BRONZE",
    tierProgress: {
      currentTierSpent: 0,
      nextTierThreshold: 2000000,
      progressPercentage: 0,
      nextTier: "SILVER",
    },
    totalPointsEarned: 0,
    totalPointsRedeemed: 0,
  };

  // --- 3. Success State ---
  return (
    <div className="space-y-6">
      {/* 1. Hero Balance Bento Card */}
      <PointsBalanceHeroCard
        summary={fallbackSummary}
        onViewGuide={() => setShowGuide((prev) => !prev)}
      />

      {/* 2. Policy Guide Card (Toggle / Collapsible) */}
      {showGuide && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <PointsRuleGuideCard config={config} />
        </div>
      )}

      {/* 3. Transaction History Section */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900 font-headline">
              Lịch Sử Biến Động Điểm
            </h3>
            <p className="text-xs text-slate-500">
              Theo dõi chi tiết các lượt cộng, trừ và hoàn điểm minh bạch
            </p>
          </div>

          <PointsHistoryFilter
            currentFilter={currentFilter}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* Loading Spinner or List */}
        {isLoadingHistory ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-3 border-orange-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400">Đang tải lịch sử giao dịch...</p>
          </div>
        ) : (
          <PointsHistoryTable items={historyItems} />
        )}

        {/* Pagination */}
        {!isLoadingHistory && paginationMeta.totalPages > 1 && (
          <PointsHistoryPagination
            meta={paginationMeta}
            onPageChange={setCurrentPage}
          />
        )}
      </div>

      {/* 4. Mini Policy reminder (if guide is closed) */}
      {!showGuide && <PointsRuleGuideCard config={config} />}
    </div>
  );
};
