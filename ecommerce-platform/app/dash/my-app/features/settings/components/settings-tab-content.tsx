'use client';

import { SettingsTab, SystemSettingsPayload, EmailSettings } from '../types/settings.types';
import GeneralSettingsForm from './forms/general-settings-form';
import PaymentSettingsForm from './forms/payment-settings-form';
import ShippingSettingsForm from './forms/shipping-settings-form';
import BannerRepeaterManager from './repeaters/banner-repeater-manager';
import MenuRepeaterManager from './repeaters/menu-repeater-manager';
import SeoSocialSettingsForm from './forms/seo-social-settings-form';
import EmailSettingsForm from './forms/email-settings-form';

interface SettingsTabContentProps {
  activeTab: SettingsTab;
  data: SystemSettingsPayload;
  onChange: (updated: SystemSettingsPayload) => void;
}

const DEFAULT_EMAIL: EmailSettings = {
  smtpHost: '',
  smtpPort: 587,
  smtpEncryption: 'tls',
  smtpUser: '',
  fromName: '',
  fromEmail: '',
};

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
    case 'email':
      return (
        <EmailSettingsForm
          data={data.email ?? DEFAULT_EMAIL}
          onChange={(updated) => onChange({ ...data, email: updated })}
        />
      );
    default:
      return null;
  }
};

export default SettingsTabContent;
