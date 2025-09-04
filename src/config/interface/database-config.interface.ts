export interface DatabaseConfigI {
  host: string;
  database: string;
  port: number;
  username: string;
  password: string;
  type: string;
  entities: string[];
  migrations: string[];
  synchronize: boolean;
  autoLoadEntities: boolean;
}
