'use client';

import { SettingsTab, SystemSettingsPayload } from '../types/settings.types';
import GeneralSettingsForm from './forms/general-settings-form';
import PaymentSettingsForm from './forms/payment-settings-form';
import ShippingSettingsForm from './forms/shipping-settings-form';
import BannerRepeaterManager from './repeaters/banner-repeater-manager';
import MenuRepeaterManager from './repeaters/menu-repeater-manager';
import SeoSocialSettingsForm from './forms/seo-social-settings-form';

interface SettingsTabContentProps {
  activeTab: SettingsTab;
  data: SystemSettingsPayload;
  onChange: (updated: SystemSettingsPayload) => void;
}

const SettingsTabContent = ({ activeTab, data, onChange }: SettingsTabContentProps) => {
  switch (activeTab) {
    case 'general':
      return (
        <GeneralSettingsForm
          data={data.general}
          onChange={(updated) => onChange({ ...data, general: updated })}
        />
      );
    case 'payment':
      return (
        <PaymentSettingsForm
          data={data.payment}
          onChange={(updated) => onChange({ ...data, payment: updated })}
        />
      );
    case 'shipping':
      return (
        <ShippingSettingsForm
          data={data.shipping}
          onChange={(updated) => onChange({ ...data, shipping: updated })}
        />
      );
    case 'banners':
      return (
        <BannerRepeaterManager
          banners={data.banners}
          onChange={(updatedBanners) => onChange({ ...data, banners: updatedBanners })}
        />
      );
    case 'menus':
      return (
        <MenuRepeaterManager
          menus={data.menus}
          onChange={(updatedMenus) => onChange({ ...data, menus: updatedMenus })}
        />
      );
    case 'seo':
      return (
        <SeoSocialSettingsForm
          data={data.seo}
          onChange={(updated) => onChange({ ...data, seo: updated })}
        />
      );
    default:
      return null;
  }
};

export default SettingsTabContent;
