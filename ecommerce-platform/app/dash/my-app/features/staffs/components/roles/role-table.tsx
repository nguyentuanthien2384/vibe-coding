'use client';
import React from 'react';
import { Shield, Pencil, Trash2, MoreHorizontal } from 'lucide-react';
import { StaffRoleGroup } from '../../types/staff.types';

interface RoleTableProps {
  roleGroups: StaffRoleGroup[];
  onEdit: (group: StaffRoleGroup) => void;
  onDelete: (groupId: string | number) => void;
}


export default function RoleTable({ roleGroups, onEdit, onDelete }: RoleTableProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full whitespace-nowrap">
          <thead className="bg-[#F8FAFC]/80 dark:bg-slate-800/40 border-b border-gray-100 dark:border-slate-800">
            <tr>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                TÊN NHÓM QUYỀN
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                MÔ TẢ
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                SỐ NHÂN VIÊN
              </th>
              <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                HỆ THỐNG
              </th>
              <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase tracking-wider">
                THAO TÁC
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
            {roleGroups.map((group) => (
              <tr
                key={group.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
              >
                {/* TÊN NHÓM QUYỀN */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">
                      {group.name}
                    </span>
                  </div>
                </td>

                {/* MÔ TẢ */}
                <td className="px-6 py-5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 max-w-md block truncate">
                    {group.description}
                  </span>
                </td>

                {/* SỐ NHÂN VIÊN */}
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full">
                    {group.memberCount} thành viên
                  </span>
                </td>

                {/* HỆ THỐNG */}
                <td className="px-6 py-5 whitespace-nowrap">
                  {group.isSystem ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF3C7] text-[#D97706] dark:bg-amber-950/40 dark:text-amber-400">
                      System
                    </span>
                  ) : (
                    <span className="text-slate-300 text-sm">—</span>
                  )}
                </td>

                {/* THAO TÁC */}
                <td className="px-6 py-5 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {!group.isSystem ? (
                      <>
                        <button
                          type="button"
                          onClick={() => onEdit(group)}
                          className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/30 rounded-lg transition-colors"
                          title="Chỉnh sửa nhóm"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(group.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors"
                          title="Xóa nhóm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <span className="p-2 text-slate-300 dark:text-slate-700 cursor-not-allowed">
                        <Pencil className="w-4 h-4" />
                      </span>
                    )}

                    <button
                      type="button"
                      className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
