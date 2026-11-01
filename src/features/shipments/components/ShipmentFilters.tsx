import { useAppDispatch, useAppSelector } from '@/app/hooks';
import { DatePicker } from '@/components/ui/DatePicker';
import { FilterMenu, type FilterMenuItem } from '@/components/ui/FilterMenu';
import { MultiSelect, type SelectOption } from '@/components/ui/MultiSelect';
import { SearchInput } from '@/components/ui/SearchInput';
import { SuggestionSearch } from '@/components/ui/SuggestionSearch';
import { selectAllDrivers } from '@/features/drivers/store/selectors';
import { PRIORITY_LABELS, STATUS_LABELS } from '../constants';
import { selectAddressSuggestions, selectFilters } from '../store/selectors';
import {
  setAddressQuery,
  setDate,
  setDriverIds,
  setPriorities,
  setQuery,
  setStatuses,
} from '../store/shipmentsViewSlice';
import { PRIORITIES, SHIPMENT_STATUSES, type Priority, type ShipmentStatus } from '../types';
import { SHIPMENT_SEARCH_ID } from './searchFocus';

const statusOptions: SelectOption<ShipmentStatus>[] = SHIPMENT_STATUSES.map((value) => ({
  value,
  label: STATUS_LABELS[value],
}));

const priorityOptions: SelectOption<Priority>[] = PRIORITIES.map((value) => ({
  value,
  label: PRIORITY_LABELS[value],
}));

const countLabel = (selected: number, total: number) =>
  selected > 0 ? `${selected} de ${total}` : undefined;

export function ShipmentFilters() {
  const dispatch = useAppDispatch();
  const filters = useAppSelector(selectFilters);
  const drivers = useAppSelector(selectAllDrivers);
  const addressSuggestions = useAppSelector(selectAddressSuggestions);

  const driverOptions = drivers.map((driver) => ({ value: driver.id, label: driver.name }));

  const menuItems: FilterMenuItem[] = [
    {
      id: 'address',
      label: 'Dirección',
      icon: 'locate',
      render: ({ close }) => (
        <SuggestionSearch
          label="Buscar dirección"
          hint="Escribe y selecciona una dirección"
          suggestions={addressSuggestions}
          defaultQuery={filters.addressQuery}
          onSelect={(address) => {
            dispatch(setAddressQuery(address));
            close();
          }}
        />
      ),
    },
    {
      id: 'date',
      label: 'Fecha',
      icon: 'calendar',
      render: () => (
        <DatePicker
          label="Fecha de entrega estimada"
          value={filters.date}
          onChange={(date) => {
            dispatch(setDate(date));
          }}
        />
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <SearchInput
          id={SHIPMENT_SEARCH_ID}
          label="Buscar por número, seguimiento, cliente o dirección"
          placeholder="Buscar por número, cliente o dirección"
          value={filters.query}
          onChange={(query) => dispatch(setQuery(query))}
        />
        <FilterMenu
          label="Filtrar por dirección o fecha"
          items={menuItems}
          active={filters.addressQuery.trim() !== '' || filters.date !== undefined}
        />
      </div>
      <div className="grid grid-cols-2 gap-x-3 gap-y-3">
        <MultiSelect
          label="Estado"
          secondLabel={countLabel(filters.statuses.length, statusOptions.length)}
          options={statusOptions}
          value={filters.statuses}
          onChange={(statuses) => dispatch(setStatuses(statuses))}
        />
        <MultiSelect
          label="Prioridad"
          secondLabel={countLabel(filters.priorities.length, priorityOptions.length)}
          options={priorityOptions}
          value={filters.priorities}
          onChange={(priorities) => dispatch(setPriorities(priorities))}
        />
        <MultiSelect
          label="Conductor"
          secondLabel={countLabel(filters.driverIds.length, driverOptions.length)}
          options={driverOptions}
          value={filters.driverIds}
          onChange={(driverIds) => dispatch(setDriverIds(driverIds))}
          className="col-span-2"
        />
      </div>
    </div>
  );
}
