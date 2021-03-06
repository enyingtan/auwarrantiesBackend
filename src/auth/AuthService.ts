import * as express from 'express';
import { Service } from 'typedi';
import { OrmRepository } from 'typeorm-typedi-extensions';

import { User } from '../api/models/User';
import { UserRepository } from '../api/repositories/UserRepository';
import { Logger, LoggerInterface } from '../decorators/Logger';
import utilService from '../api/services/UtilService';

@Service()
export class AuthService {

    constructor(
        @Logger(__filename) private log: LoggerInterface,
        @OrmRepository() private userRepository: UserRepository
    ) { }

    public parseBearerAuthFromRequest(req: express.Request): { username: string, password: string } {
        const authorization = req.header('authorization');

        if (authorization && authorization.split(' ')[0] === 'Bearer') {

            const token = authorization.split(' ')[1];
            // console.log('bearer', token);
            const data = utilService.parseToken(token);
            // console.log('parsed', data);

            return data;

            // Basic Auth
            // const decodedBase64 = Buffer.from(authorization.split(' ')[1], 'base64').toString('ascii');
            // const username = decodedBase64.split(':')[0];
            // const password = decodedBase64.split(':')[1];
            // if (username && password) {
            //     return { username, password };
            // }
        }

        this.log.info('No credentials provided by the client');
        return undefined;
    }

    public async validateUser(username: string, password: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: {
                username,
            },
        });

        if (await User.comparePassword(user, password)) {
            return user;
        }

        return undefined;
    }

}
