export const replaceMongoIdInArray = (array) => {
    const mappedArray = array
        .map((item) => {
            return {
                id: item._id.toString(),
                ...item,
            };
        })
        .map(({ _id, ...rest }) => rest);

    return mappedArray;
};

export const replaceMongoIdInObject = (obj) => {
    if (!obj) return null;
    const { _id, ...updatedObj } = { ...obj, id: obj._id.toString() };
    return updatedObj;
};

// Mongoose kept a reference field (e.g. `course`) holding either the raw id
// or, once `.populate()` was called, the populated document — same field
// name either way. Prisma instead always exposes the scalar FK (`courseId`)
// separately from the relation object (`course`, only present when
// `include`d). When a query does NOT include a relation, this helper
// renames the scalar FK back to the plain ref name so existing code that
// reads `.course` / `.student` / `.user` etc. keeps working unchanged.
export const mapScalarRefs = (obj, mapping) => {
    if (!obj) return obj;
    const result = { ...obj };
    for (const [scalarKey, refName] of Object.entries(mapping)) {
        if (refName in result) continue; // already populated/included
        if (scalarKey in result) {
            result[refName] = result[scalarKey];
        }
    }
    return result;
};

export const mapScalarRefsInArray = (array, mapping) => {
    return array.map((item) => mapScalarRefs(item, mapping));
};

export const getSlug = (title) => {
    if (!title) return null;

    const slug = title
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-') // spaces -> hyphens
        .replace(/[^\p{L}\p{N}-]+/gu, '') // strip anything that isn't a letter (any language), number, or hyphen
        .replace(/-+/g, '-') // collapse repeated hyphens
        .replace(/^-+|-+$/g, ''); // trim leading/trailing hyphens

    return slug || null;
};

// Mongoose's ObjectId casting is lenient: `Model.findById(x)` works whether
// `x` is a raw id string OR a full (populated) document that has an `_id`
// (it just reads `._id` off of it). Prisma has no equivalent leniency — a
// `where: { id: <object> }` throws a validation error. Some existing
// components (not touched during the migration) rely on that Mongoose
// convenience, e.g. passing an already-populated lesson object around as
// if it were just its id. This helper restores that leniency so those
// components keep working unchanged.
export const toIdString = (value) => {
    if (value === null || value === undefined) return value;
    if (typeof value === 'string') return value;
    if (typeof value === 'object') {
        if (typeof value.id === 'string') return value.id;
        if (typeof value._id === 'string') return value._id;
    }
    return value;
};
