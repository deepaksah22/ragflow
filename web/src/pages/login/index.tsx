import { useLogin, useRegister } from '@/hooks/login-hooks';
import { rsaPsw } from '@/utils';
import { Button, Checkbox, Form, Input } from 'antd';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon, useNavigate } from 'umi';
import RightPanel from './right-panel';
import { Domain } from '@/constants/common';
import styles from './index.less';

const Login = () => {
  const [title, setTitle] = useState('login');
  const navigate = useNavigate();
  const { login, loading: signLoading } = useLogin();
  const { register, loading: registerLoading } = useRegister();
  const { t } = useTranslation('translation', { keyPrefix: 'login' });
  const loading = signLoading || registerLoading;
  const [form] = Form.useForm();

  useEffect(() => {
    // Fetch saved credentials from localStorage
    const storedEmail = localStorage.getItem('email');
    const storedPassword = localStorage.getItem('password');

    if (storedEmail && storedPassword) {
      form.setFieldsValue({
        email: storedEmail,
        password: storedPassword,
      });
    }
  }, [form]);

  const changeTitle = () => {
    setTitle((prevTitle) => (prevTitle === 'login' ? 'register' : 'login'));
  };

  const onCheck = async () => {
    try {
      const params = await form.validateFields();
      const email = params.email.trim();
      const rsaPassword = rsaPsw(params.password); // Encrypt password

      if (title === 'login') {
        const code = await login({ email, password: rsaPassword });
        if (code === 0) {
          navigate('/knowledge');
        }
      } else {
        const code = await register({
          nickname: params.nickname,
          email,
          password: rsaPassword,
        });
        if (code === 0) {
          setTitle('login');
        }
      }

      // Save credentials for future logins
      localStorage.setItem('email', email);
      localStorage.setItem('password', params.password);
    } catch (error) {
      console.error('Validation Failed:', error);
    }
  };

  const toGoogle = () => {
    window.location.href =
      'https://github.com/login/oauth/authorize?scope=user:email&client_id=302129228f0d96055bee';
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginLeft}>
        <div className={styles.leftContainer}>
          <div className={styles.loginTitle}>
            <div>{title === 'login' ? t('login') : t('register')}</div>
            <span>
              {title === 'login' ? t('loginDescription') : t('registerDescription')}
            </span>
          </div>

          <Form form={form} layout="vertical" name="login_form" style={{ maxWidth: 600 }}>
            <Form.Item
              name="email"
              label={t('emailLabel')}
              rules={[{ required: true, message: t('emailPlaceholder') }]}
            >
              <Input size="large" placeholder={t('emailPlaceholder')} />
            </Form.Item>

            {title === 'register' && (
              <Form.Item
                name="nickname"
                label={t('nicknameLabel')}
                rules={[{ required: true, message: t('nicknamePlaceholder') }]}
              >
                <Input size="large" placeholder={t('nicknamePlaceholder')} />
              </Form.Item>
            )}

            <Form.Item
              name="password"
              label={t('passwordLabel')}
              rules={[{ required: true, message: t('passwordPlaceholder') }]}
            >
              <Input.Password size="large" placeholder={t('passwordPlaceholder')} onPressEnter={onCheck} />
            </Form.Item>

            {title === 'login' && (
              <Form.Item name="remember" valuePropName="checked">
                <Checkbox> {t('rememberMe')}</Checkbox>
              </Form.Item>
            )}

            <div>
              {title === 'login' ? (
                <div>
                  {t('signInTip')}
                  <Button type="link" onClick={changeTitle}>
                    {t('signUp')}
                  </Button>
                </div>
              ) : (
                <div>
                  {t('signUpTip')}
                  <Button type="link" onClick={changeTitle}>
                    {t('login')}
                  </Button>
                </div>
              )}
            </div>

            <Button type="primary" block size="large" onClick={onCheck} loading={loading}>
              {title === 'login' ? t('login') : t('continue')}
            </Button>

            {title === 'login' && (
              <>
                {location.host === Domain && (
                  <Button block size="large" onClick={toGoogle} style={{ marginTop: 15 }}>
                    <div className="flex items-center">
                      <Icon icon="local:github" style={{ verticalAlign: 'middle', marginRight: 5 }} />
                      Sign in with Github
                    </div>
                  </Button>
                )}
              </>
            )}
          </Form>
        </div>
      </div>
      <div className={styles.loginRight}>
        <RightPanel />
      </div>
    </div>
  );
};

export default Login;
