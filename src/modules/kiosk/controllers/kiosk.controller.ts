import { Router, Request, Response } from 'express';
import { authMiddleware } from '../../../middlewares/auth.middleware';
import { validationResult } from 'express-validator';
import { AuthenticatedRequest } from '../../../types/custom';
import KioskService from '../services/kiosk.service';

class KioskController {
  public router: Router;
  private readonly kioskService: KioskService;

  constructor() {
    this.router = Router();
    this.kioskService = new KioskService();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.use(authMiddleware);

    this.router.post('/kiosks', (req, res) =>
      this.createKiosk(req as unknown as AuthenticatedRequest, res)
    );
    this.router.get('/kiosks/:id', this.getKiosk.bind(this));
    this.router.put('/kiosks/:id', (req, res) =>
      this.updateKiosk(req as unknown as AuthenticatedRequest, res)
    );
    this.router.delete('/kiosks/:id', (req, res) =>
      this.deleteKiosk(req as unknown as AuthenticatedRequest, res)
    );
    this.router.post('/kiosks/search', this.searchKiosks.bind(this));
  }

  private async createKiosk(req: AuthenticatedRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    try {
      const { title, description, geolocation } = req.body;
      const userId = req.user.id;

      const kiosk = await this.kioskService.create({
        title,
        description,
        geolocation,
        userId,
      });
      res.status(201).json(kiosk);
    } catch (error) {
      res.status(500).json({ error: 'Error creating kiosk' + error });
    }
  }

  private async getKiosk(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const kiosk = await this.kioskService.getById(Number(id));

      if (!kiosk) {
        res.status(404).json({ error: 'Kiosk not found' });
        return;
      }

      res.status(200).json(kiosk);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching kiosk' });
    }
  }

  private async updateKiosk(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const updatedKiosk = await this.kioskService.update(
        Number(id),
        userId,
        req.body
      );

      if (!updatedKiosk) {
        res.status(404).json({ error: 'Kiosk not found' });
        return;
      }

      res.status(200).json({ success: 'Kiosk updated', kiosk: updatedKiosk });
    } catch (error) {
      res.status(500).json({ error: 'Error updating kiosk' });
    }
  }

  private async deleteKiosk(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;
      const deleted = await this.kioskService.delete(Number(id), userId);

      if (!deleted) {
        res.status(404).json({ error: 'Kiosk not found' });

        return;
      }

      res.status(200).json({ success: 'Kiosk deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Error deleting kiosk' });
    }
  }

  private async searchKiosks(req: Request, res: Response) {
    try {
      const { geolocation, maxDistance, page = 1, offset = 0 } = req.body;
      const results = await this.kioskService.search(
        geolocation,
        maxDistance,
        page,
        offset
      );

      res.status(200).json(results);
    } catch (error) {
      res.status(500).json({ error: 'Error searching kiosks' });
    }
  }
}

export default KioskController;
