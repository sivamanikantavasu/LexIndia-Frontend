import { apiGet, apiPost } from './api';

export async function getRandomCaptcha() {
  const response = await apiGet('/captcha/random');
  return response.captcha;
}

export async function validateCaptcha(userInput, correctCaptcha) {
  const response = await apiPost('/captcha/validate', { userInput, correctCaptcha });
  return response.valid;
}
