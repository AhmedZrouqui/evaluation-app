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

    this.router.post('/kiosks', (req: Request, res: Response) =>
      this.createKiosk(req as AuthenticatedRequest, res)
    );
    this.router.get('/kiosks/:id', (req: Request, res: Response) =>
      this.getKiosk(req as AuthenticatedRequest, res)
    );
    this.router.put('/kiosks/:id', (req: Request, res: Response) =>
      this.updateKiosk(req as AuthenticatedRequest, res)
    );

    this.router.delete('/kiosks/:id', (req: Request, res: Response) =>
      this.deleteKiosk(req as unknown as AuthenticatedRequest, res)
    );
    this.router.post('/kiosks/search', this.searchKiosks.bind(this));
  }

  protected async createKiosk(req: AuthenticatedRequest, res: Response) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });

      return;
    }

    try {
      const { title, description, geolocation } = req.body;

      if (!title || !description || !geolocation) {
        res.status(400).json({
          errors: [{ msg: 'Missing required fields' }],
        });

        return;
      }

      if (
        !geolocation.lat ||
        !geolocation.lng ||
        typeof geolocation.lat !== 'number' ||
        typeof geolocation.lng !== 'number'
      ) {
        res.status(400).json({
          errors: [{ msg: 'Invalid geolocation format' }],
        });

        return;
      }

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

  protected async getKiosk(req: Request, res: Response) {
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

  protected async updateKiosk(req: AuthenticatedRequest, res: Response) {
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

  protected async deleteKiosk(req: AuthenticatedRequest, res: Response) {
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

  protected async searchKiosks(req: Request, res: Response) {
    try {
      const { geolocation, maxDistance, page = 1, offset = 0 } = req.body;

      if (!geolocation || !maxDistance) {
        res.status(400).json({
          errors: [{ msg: 'Missing required search parameters' }],
        });

        return;
      }

      if (
        !geolocation.lat ||
        !geolocation.lng ||
        typeof geolocation.lat !== 'number' ||
        typeof geolocation.lng !== 'number' ||
        geolocation.lat < -90 ||
        geolocation.lat > 90 ||
        geolocation.lng < -180 ||
        geolocation.lng > 180
      ) {
        res.status(400).json({
          errors: [{ msg: 'Invalid geolocation coordinates' }],
        });

        return;
      }

      if (typeof maxDistance !== 'number' || maxDistance <= 0) {
        res.status(400).json({
          errors: [{ msg: 'Invalid maxDistance value' }],
        });

        return;
      }

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
