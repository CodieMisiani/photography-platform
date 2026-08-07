import type { Request, Response } from "express";
import {
  createPortfolioEvent,
  createProjectPhoto,
  deletePortfolioEvent,
  deleteProjectPhoto,
  getPortfolioEvent,
  listPortfolioEvents,
  listAdminPortfolioEvents,
  listPortfolioCategories, createPortfolioCategory, renamePortfolioCategory, deletePortfolioCategory,
  listProjectPhotos,
  reorderProjectPhotos,
  updatePortfolioEvent,
  updateProjectPhoto,
} from "../services/portfolioService.js";
import { uploadMedia } from "../services/mediaService.js";

export async function listPortfolio(req: Request, res: Response) {
  const featured = req.query.featured === "true";
  const limitValue =
    typeof req.query.limit === "string" ? Number(req.query.limit) : undefined;

  res.status(200).json({
    events: await listPortfolioEvents({ featured, limit: limitValue }),
  });
}
export async function listAdminPortfolio(_req: Request, res: Response) { res.status(200).json({ events: await listAdminPortfolioEvents() }); }
export async function listCategories(_req: Request, res: Response) { res.status(200).json({ categories: await listPortfolioCategories() }); }
export async function createCategory(req: Request, res: Response) { res.status(201).json({ category: await createPortfolioCategory(String(req.body.name)) }); }
export async function patchCategory(req: Request, res: Response) { res.status(200).json({ category: await renamePortfolioCategory(String(req.params.categoryId), String(req.body.name)) }); }
export async function removeCategory(req: Request, res: Response) { await deletePortfolioCategory(String(req.params.categoryId)); res.status(204).send(); }

export async function getPortfolioDetail(req: Request, res: Response) {
  res
    .status(200)
    .json({ event: await getPortfolioEvent(String(req.params.id)) });
}

export async function createPortfolio(req: Request, res: Response) {
  res.status(201).json({ event: await createPortfolioEvent(req.body) });
}

export async function patchPortfolio(req: Request, res: Response) {
  res.status(200).json({
    event: await updatePortfolioEvent(String(req.params.id), req.body),
  });
}

export async function removePortfolio(req: Request, res: Response) {
  await deletePortfolioEvent(String(req.params.id));
  res.status(204).send();
}

export async function uploadPortfolioAsset(req: Request, res: Response) {
  res.status(201).json(await uploadMedia(req.file, { folder: "portfolio" }));
}

export async function listPortfolioPhotos(req: Request, res: Response) {
  res
    .status(200)
    .json({ photos: await listProjectPhotos(String(req.params.id)) });
}

export async function createPortfolioPhoto(req: Request, res: Response) {
  const upload = await uploadMedia(req.file, { folder: "portfolio" });
  const photo = await createProjectPhoto(String(req.params.id), {
    cloudinary_url: upload.url,
    cloudinary_public_id: upload.public_id,
    caption:
      typeof req.body?.caption === "string" ? req.body.caption : undefined,
    alt_text:
      typeof req.body?.alt_text === "string" ? req.body.alt_text : undefined,
    sort_order:
      typeof req.body?.sort_order === "string"
        ? Number(req.body.sort_order)
        : undefined,
  });
  res.status(201).json({ photo });
}

export async function createPortfolioPhotoFromUrl(req: Request, res: Response) {
  const imageUrl = typeof req.body?.image_url === "string" ? req.body.image_url : "";
  try {
    const url = new URL(imageUrl);
    if (url.protocol !== "http:" && url.protocol !== "https:") throw new Error("protocol");
  } catch {
    throw new Error("A valid image URL is required");
  }
  const photo = await createProjectPhoto(String(req.params.id), {
    cloudinary_url: imageUrl,
    cloudinary_public_id: null,
    sort_order: typeof req.body?.sort_order === "number" ? req.body.sort_order : undefined,
  });
  res.status(201).json({ photo });
}

export async function patchPortfolioPhoto(req: Request, res: Response) {
  const photo = await updateProjectPhoto(
    String(req.params.id),
    String(req.params.photoId),
    {
      caption:
        typeof req.body?.caption === "string" ? req.body.caption : undefined,
      alt_text:
        typeof req.body?.alt_text === "string" ? req.body.alt_text : undefined,
      sort_order:
        typeof req.body?.sort_order === "number"
          ? req.body.sort_order
          : undefined,
    },
  );
  res.status(200).json({ photo });
}

export async function deletePortfolioPhoto(req: Request, res: Response) {
  await deleteProjectPhoto(String(req.params.id), String(req.params.photoId));
  res.status(204).send();
}

export async function reorderPortfolioPhotos(req: Request, res: Response) {
  const photos = Array.isArray(req.body?.photos) ? req.body.photos : [];
  const reordered = await reorderProjectPhotos(String(req.params.id), photos);
  res.status(200).json({ photos: reordered });
}
