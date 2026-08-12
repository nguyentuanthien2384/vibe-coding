export interface StatusBadgeProps {
  isActive: boolean;
}

const StatusBadge = ({ isActive }: StatusBadgeProps) => {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          isActive ? 'bg-green-500' : 'bg-gray-400'
        }`}
      />
      {isActive ? 'Hoạt động' : 'Ẩn'}
    </span>
  );
};

export default StatusBadge;
