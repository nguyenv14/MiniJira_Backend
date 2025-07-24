import { Model } from 'mongoose';

export interface BaseSearchOptions {
  page?: number;
  limit?: number;
  sort?: string;
  key?: string;
  searchFields?: string[];
  customQuery?: (query: any) => void;
  selectFields?: string[]; // optional
}

export class BaseSearchService {
  static async search<T>(
    model: Model<T>,
    options: BaseSearchOptions
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      page = 1,
      limit = 10,
      sort = 'createdAt:desc',
      key,
      searchFields = [],
      customQuery,
      selectFields = [],
    } = options;

    const skip = (page - 1) * limit;
    const query: any = {};

    // 🔍 Free-text search
    if (key && searchFields.length > 0) {
      query.$or = searchFields.map((field) => ({
        [field]: { $regex: key, $options: 'i' },
      }));
    }

    // 🧩 Custom filter logic
    if (customQuery) {
      customQuery(query);
    }

    // 🔽 Sorting
    const sortObj: Record<string, 1 | -1> = {};
    sort.split(',').forEach((s) => {
      const [field, dir] = s.split(':');
      sortObj[field] = dir === 'desc' ? -1 : 1;
    });

    const queryBuilder = model.find(query).sort(sortObj).skip(skip).limit(limit);
    if (selectFields.length > 0) {
      queryBuilder.select(selectFields.join(' '));
    }

    const [data, total] = await Promise.all([
      queryBuilder.exec(),
      model.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
