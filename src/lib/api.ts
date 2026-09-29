import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import type { z } from 'zod';
import { requireAdminSession } from '@/lib/admin-auth';
import { zodMessage } from '@/lib/validators';

export function jsonError(message: string, status: number, extra?: Record<string, unknown>) {
  return NextResponse.json({ error: message, ...extra }, { status });
}

/** Re-render every public page that shows portfolio data. */
export function revalidatePublic() {
  try {
    revalidatePath('/', 'layout');
  } catch (error) {
    console.error('revalidatePath failed', error);
  }
}

export async function readJson(request: NextRequest): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function handleError(error: unknown, what: string) {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2025') return jsonError(`${what} not found`, 404);
    if (error.code === 'P2002') return jsonError(`A ${what.toLowerCase()} with that value already exists`, 409);
    if (error.code === 'P2023') return jsonError(`Invalid ${what.toLowerCase()} id`, 400);
  }
  console.error(`[api] ${what}:`, error);
  return jsonError(`Something went wrong while saving the ${what.toLowerCase()}.`, 500);
}

/** Minimal shape of a Prisma model delegate used by the generic handlers. */
type Delegate = {
  findMany(args?: object): Promise<unknown[]>;
  create(args: { data: object }): Promise<unknown>;
  update(args: { where: { id: string }; data: object }): Promise<unknown>;
  delete(args: { where: { id: string } }): Promise<unknown>;
};

type ParamsCtx = { params: Promise<{ id: string }> };

interface CollectionOptions {
  /** Human name, e.g. "Project" */
  label: string;
  delegate: () => Delegate;
  schema: z.ZodType;
  orderBy?: object;
  /** GET is public unless this is true */
  privateList?: boolean;
  /** Optional mapper applied to parsed data before writes */
  prepare?: (
    data: Record<string, unknown>,
    mode: 'create' | 'update',
    id?: string
  ) => Record<string, unknown> | Promise<Record<string, unknown>>;
}

const OBJECT_ID = /^[a-f0-9]{24}$/i;

export function collectionHandlers(opts: CollectionOptions) {
  async function GET(request: NextRequest) {
    if (opts.privateList) {
      const denied = await requireAdminSession(request);
      if (denied) return denied;
    }
    try {
      const items = await opts.delegate().findMany(opts.orderBy ? { orderBy: opts.orderBy } : undefined);
      return NextResponse.json(items);
    } catch (error) {
      return handleError(error, opts.label);
    }
  }

  async function POST(request: NextRequest) {
    const denied = await requireAdminSession(request);
    if (denied) return denied;
    const parsed = opts.schema.safeParse((await readJson(request)) ?? {});
    if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);
    try {
      let data = parsed.data as Record<string, unknown>;
      if (opts.prepare) data = await opts.prepare(data, 'create');
      const created = await opts.delegate().create({ data });
      revalidatePublic();
      return NextResponse.json(created, { status: 201 });
    } catch (error) {
      return handleError(error, opts.label);
    }
  }

  async function PUT(request: NextRequest, ctx: ParamsCtx) {
    const denied = await requireAdminSession(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!OBJECT_ID.test(id)) return jsonError(`Invalid ${opts.label.toLowerCase()} id`, 400);
    const parsed = opts.schema.safeParse((await readJson(request)) ?? {});
    if (!parsed.success) return jsonError(zodMessage(parsed.error), 400);
    try {
      let data = parsed.data as Record<string, unknown>;
      if (opts.prepare) data = await opts.prepare(data, 'update', id);
      const updated = await opts.delegate().update({ where: { id }, data });
      revalidatePublic();
      return NextResponse.json(updated);
    } catch (error) {
      return handleError(error, opts.label);
    }
  }

  async function DELETE(request: NextRequest, ctx: ParamsCtx) {
    const denied = await requireAdminSession(request);
    if (denied) return denied;
    const { id } = await ctx.params;
    if (!OBJECT_ID.test(id)) return jsonError(`Invalid ${opts.label.toLowerCase()} id`, 400);
    try {
      await opts.delegate().delete({ where: { id } });
      revalidatePublic();
      return NextResponse.json({ success: true });
    } catch (error) {
      return handleError(error, opts.label);
    }
  }

  return { GET, POST, PUT, DELETE };
}

export { OBJECT_ID };
