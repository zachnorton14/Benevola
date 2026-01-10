const { ZodError } = require("zod");
const { ApiError } = require("../errors/ApiError");

function formatZodError(err) {
    // Keeps things contract-friendly and consistent
    return err.issues.map((i) => ({
        path: i.path.join("."),
        message: i.message,
        code: i.code,
    }));
}

function errorHandler(err, req, res, next) {
    const isProd = process.env.NODE_ENV === "production";

    // 1) Your own "operational" errors
    if (err instanceof ApiError) {
        return res.status(err.status).json({
            message: err.message,
            ...(err.details ? { details: err.details } : {}),
        });
    }

    // 2) Zod validation errors
    if (err instanceof ZodError) {
        return res.status(400).json({
            message: "Validation error",
            details: formatZodError(err),
        });
    }

    // 3) Sequelize errors (common ones)
    // Note: SQLite + Sequelize will often throw these for constraints/validations.
    const sequelizeName = err?.name;

    if (sequelizeName === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
            message: "Unique constraint violation",
            details: err.errors?.map((e) => ({
                path: e.path,
                message: e.message,
                value: e.value,
            })),
        });
    }

    if (sequelizeName === "SequelizeValidationError") {
        return res.status(400).json({
            message: "Database validation error",
            details: err.errors?.map((e) => ({
                path: e.path,
                message: e.message,
                value: e.value,
            })),
        });
    }

    if (sequelizeName === "SequelizeForeignKeyConstraintError") {
        return res.status(409).json({
            message: "Foreign key constraint violation",
            details: {
                table: err.table,
                fields: err.fields,
                index: err.index,
            },
        });
    }

    // 4) Fallback: unexpected errors
    // Log full error server-side; return minimal message to client.
    console.error(err);

    return res.status(500).json({
        message: "Internal server error",
        ...(isProd
            ? {}
            : {
                // Safe-ish dev diagnostics:
                error: err.message,
                stack: err.stack,
            }),
    });
}

module.exports = { errorHandler };
