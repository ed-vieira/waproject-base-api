import { Inject, Injectable } from '@nestjs/common';
import { MAXPROD_CONNECTION_TYPE } from 'modules/databases/maxyAllProd/module';

@Injectable()
export class UserRepository {
  constructor(@Inject('MAXPROD_CONNECTION') private connection: MAXPROD_CONNECTION_TYPE) {}

  public async getProfile(eduzzId: number): Promise<{ id: number; name: string; photo: string; vip: boolean }> {
    const result = await this.connection.raw(
      `
      SELECT 
        cli_cod as id, 
        cli_fantasia as name, 
        cli_email as email,
        '/' + upt_name + '/' + upl_name + '.' + upl_ext as photo,
        CAST(CASE WHEN cli_gconta_cod <> '' THEN 1 ELSE 0 END as BIT) as vip
      FROM TClientes
      LEFT JOIN TUpload ON cli_foto = upl_cod AND upl_remover = 0
      LEFT JOIN TUploadtype ON upl_upt_cod = upt_cod
      WHERE cli_cod = ?;
    `,
      [eduzzId]
    );

    return result[0];
  }
}
