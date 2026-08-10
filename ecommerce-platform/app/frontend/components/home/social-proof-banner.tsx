interface SocialProofBannerProps {
  statNumber: string;
  message: string;
}

export const SocialProofBanner = ({
  statNumber,
  message,
}: SocialProofBannerProps) => {
  return (
    <div className="bg-slate-900 rounded-2xl py-5 px-8 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 text-center my-8">
      <span className="text-3xl font-extrabold text-orange-500">
        {statNumber}
      </span>
      <span className="text-sm md:text-base text-slate-300 font-medium">
        {message}
      </span>
    </div>
  );
};
