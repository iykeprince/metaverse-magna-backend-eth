import { Request, Response, Router } from 'express';
import { Container } from 'typedi';
import { AuthService } from '../services/auth.service';
import { AxiosError } from 'axios';

const router = Router();
const authService = Container.get(AuthService);

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await authService.register(username, password);
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: (error as AxiosError).message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const token = await authService.login(username, password);
    res.json({ token });
  } catch (error) {
    res.status(400).json({ error: (error as AxiosError).message });
  }
});

export default router;
