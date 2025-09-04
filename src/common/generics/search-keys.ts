import { Property } from '../../database/entities/property.entity';
import { Lease } from '../../database/entities/lease.entity';
import { User } from '../../database/entities/user.entity';
import { Billing } from '../../database/entities/billing.entity';
import { Report } from '../../database/entities/report.entity';
import { Notification } from 'src/database/entities/notification.entity';

type EntityKeys<T> = (keyof Partial<T>)[];

export const PROPERTY_KEYS: EntityKeys<Property> = ['name', 'address'];
export const USER_KEYS: EntityKeys<User> = ['email', 'firstName', 'lastName'];
export const BILLING_KEYS: EntityKeys<Billing> = ['amount', 'status'];
export const LEASE_KEYS: EntityKeys<Lease> = ['code', 'paymentDay', 'status'];
export const REPORT_KEYS: EntityKeys<Report> = [
  'cancelled_reason',
  'description',
  'status',
  'priority',
];
export const NOTIFICATION_KEYS: EntityKeys<Notification> = [
  'notificationType',
  'status',
  'message',
];
