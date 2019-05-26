import { postal_codes } from '../queries/models';
import { get_csv_rows } from './stream-pipeline';

const ZIP_URL = 'https://download.geonames.org/export/zip/allCountries.zip';
const PARSE_OPTIONS = {
	columns: Object.keys(postal_codes.columns),
	delimiter: '\t',
	quote: false
};

export async function* get_postal_codes() {
	yield* get_csv_rows(ZIP_URL, PARSE_OPTIONS);
}
