import {TokenService} from '@loopback/authentication';
import {
  MyUserService,
  TokenServiceBindings,
  User,
  UserServiceBindings,
} from '@loopback/authentication-jwt';
import {inject} from '@loopback/core';
import {model} from '@loopback/repository';
import {get} from '@loopback/rest';

@model()
export class NewUser extends User {}

export class AuthController {
  constructor(
    @inject(TokenServiceBindings.TOKEN_SERVICE)
    public jwtService: TokenService,
    @inject(UserServiceBindings.USER_SERVICE)
    public userService: MyUserService,
  ) {}

  @get('/auth', {
    responses: {
      '200': {
        description: 'Token',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                token: {
                  type: 'string',
                },
              },
            },
          },
        },
      },
    },
  })
  async getToken(): Promise<{token: string}> {
    const userProfile = this.userService.convertToUserProfile(
      new NewUser({
        email: 'eliasramos159@gmail.com',
        id: '1',
        username: 'Elias',
      }),
    );

    // create a JSON Web Token based on the user profile
    const token = await this.jwtService.generateToken(userProfile);
    return {token};
  }
}
