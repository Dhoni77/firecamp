import { FC, useState } from 'react';
import { useForm } from '@mantine/form';
import { Drawer, IModal, Button, Input, FcLogo } from '@firecamp/ui';
import { VscEye } from '@react-icons/all-files/vsc/VscEye';

import _auth from '../../../services/auth';
import GithubGoogleAuth from './GithubGoogleAuth';
import platformContext from '../../../services/platform-context';
import { Regex } from '../../../constants';

/**
 * User Sign up
 */
const SignUp: FC<IModal> = ({ opened, onClose }) => {
  const [showPassword, toggleShowPassword] = useState(false);
  const [isRequesting, setFlagIsRequesting] = useState(false);

  const form = useForm({
    initialValues: { username: '', email: '', password: '' },

    // functions will be used to validate values at corresponding key
    validate: {
      // 1 - 50 characters
      username: (value) =>
        value.length < 6 || value.length > 20
          ? 'Please enter username within 6 - 20 letter'
          : !Regex.Username.test(value)
          ? 'The username should not have any special characters'
          : null,
      // required: true, maxLength: 50, minLength: 1, pattern: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,5})+$/,
      email: (value) => (Regex.Email.test(value) ? null : 'Invalid email'),
      // required: true, maxLength: 50, minLength: 8
      password: (value) =>
        value.length < 8 || value.length > 50
          ? 'Please enter valid password'
          : null,
    },
  });

  const { onSubmit, getInputProps, errors } = form;

  const _onSignUp = async (payload: {
    username: string;
    email: string;
    password: string;
  }) => {
    if (isRequesting) return;
    const { username, email, password } = payload;
    const _username = username.trim();
    if (_username.length < 6) {
      platformContext.app.notify.alert(
        `Username must have minimum 6 characters`
      );
      return;
    }
    if (/^[a-zA-Z0-9\_]{6,20}$/.test(_username) == false) {
      platformContext.app.notify.alert(
        `The username name must not be containing any spaces or special characters. The range should be from 6 to 20 characters`
      );
      return;
    }
    const _email = email.trim();

    setFlagIsRequesting(true);
    _auth
      .signUp({ username: _username, email: _email, password })
      .then(({ response }) => {
        // console.log(res);
        localStorage.setItem('socketId', response?.__meta?.accessToken);
        platformContext.app.initApp();
        platformContext.app.notify.success(`You have signed up successfully`, {
          labels: { alert: 'success' },
        });
        platformContext.app.modals.close();
      })
      .catch((e) => {
        // console.log(e.response)
        platformContext.app.notify.alert(
          e.response?.data?.message || e.message,
          {
            labels: { alert: 'error!' },
          }
        );
      })
      .finally(() => {
        setFlagIsRequesting(false);
      });
  };

  const _onKeyDown = (e) => e.key === 'Enter' && onSubmit(_onSignUp);

  return (
    <Drawer
      opened={opened}
      onClose={onClose}
      size={440}
      classNames={{ body: 'mt-[10vh]' }}
    >
      {/* <img className="mx-auto w-12 mb-6" src={'img/firecamp-logo.svg'} /> */}
      <div className="-mt-4">
        <FcLogo className="mx-auto w-14" size={80} />
      </div>
      <div className="text-xl mb-2 w-full text-center font-semibold">
        Create a firecamp account
      </div>
      <div className="">
        <GithubGoogleAuth />
      </div>
      <div className="relative my-3 flex justify-center items-center">
        <hr className="border-t border-app-border w-full" />
        <span className="text-xs text-app-foreground-inactive bg-modal-background absolute px-1">
          OR
        </span>
      </div>
      <div className="text-sm text-app-foreground-inactive max-w-sm mx-auto mb-3 text-center">
        Give us some of your information to get free access to Firecamp
      </div>
      <div className="">
        <form onSubmit={onSubmit(_onSignUp)}>
          <Input
            placeholder="Enter Username"
            key={'username'}
            name={'username'}
            id={'username'}
            label="Username"
            type="text"
            onKeyDown={_onKeyDown}
            classNames={{root: '!mb-4'}}
            {...getInputProps('username')}
          />
          <Input
            placeholder="Enter your email"
            key={'email'}
            name={'email'}
            id={'email'}
            label="Email"
            onKeyDown={_onKeyDown}
            classNames={{root: '!mb-4'}}
            {...getInputProps('email')}
          />
          <Input
            placeholder="Enter password"
            key={'password'}
            name={'password'}
            id={'password'}
            type={showPassword ? 'text' : 'password'}
            label="Password"
            rightSection={
              <VscEye
                title="password"
                size={16}
                onClick={() => {
                  toggleShowPassword(!showPassword);
                }}
              />
            }
            onKeyDown={_onKeyDown}
            classNames={{root: '!mb-4'}}
            {...getInputProps('password')}
          />

          <Button
            type="submit"
            text={isRequesting ? 'Signing up...' : 'Sign up'}
            onClick={onSubmit(_onSignUp)}
            fullWidth
            primary
            sm
          />
        </form>
      </div>

      <div className="flex-col">
        <div className="text-sm mt-3 text-center">
          Already have an account
          <a
            href="#"
            id="signup"
            className="font-bold underline px-1"
            onClick={(e) => {
              if (e) e.preventDefault();
              platformContext.app.modals.openSignIn();
            }}
            tabIndex={1}
          >
            {' '}
            Sign In
          </a>
        </div>
        <div className="text-sm mt-3 text-center text-app-foreground-inactive">
          By moving forward, you acknowledge that you have read and accept the
          <a
            href="https://firecamp.io/legals/privacy-policy/"
            tabIndex={1}
            className="font-bold underline px-1"
            target={'_blank'}
          >
            Term of Service
          </a>
          and
          <a
            href="https://firecamp.io/legals/privacy-policy/"
            tabIndex={1}
            className="font-bold underline px-1"
            target={'_blank'}
          >
            Privacy Policy
          </a>
          .
        </div>
      </div>
    </Drawer>
  );
};

export default SignUp;
