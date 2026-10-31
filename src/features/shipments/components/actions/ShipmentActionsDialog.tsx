import { useState } from 'react';
import { useAppSelector } from '@/app/hooks';
import { Dialog } from '@/components/ui/Dialog';
import { SegmentedControl } from '@/components/ui/SegmentedControl';
import { STATUS_LABELS } from '../../constants';
import { canAssign, canCancel, getNextStatus } from '../../rules';
import { selectShipmentById } from '../../store/selectors';
import type { ShipmentStatus } from '../../types';
import { ShipmentStatusBadge } from '../ShipmentStatusBadge';
import { AssignmentForm } from './AssignmentForm';
import { CancelForm } from './CancelForm';
import { StatusForm } from './StatusForm';

type ActionTab = 'assign' | 'status' | 'cancel';

const TAB_LABELS: Record<ActionTab, string> = {
  assign: 'Asignación',
  status: 'Estado',
  cancel: 'Cancelar',
};

function getAvailableTabs(status: ShipmentStatus): ActionTab[] {
  const tabs: ActionTab[] = [];
  if (canAssign(status)) tabs.push('assign');
  if (getNextStatus(status) !== undefined) tabs.push('status');
  if (canCancel(status)) tabs.push('cancel');
  return tabs;
}

type ShipmentActionsDialogProps = {
  id: string;
  onClose: () => void;
};

export function ShipmentActionsDialog({ id, onClose }: ShipmentActionsDialogProps) {
  const shipment = useAppSelector((state) => selectShipmentById(state, id));
  const tabs = shipment ? getAvailableTabs(shipment.status) : [];
  const [tab, setTab] = useState<ActionTab | undefined>(tabs[0]);

  if (!shipment) return null;

  return (
    <Dialog
      title={`Entrega ${shipment.id}`}
      onClose={onClose}
      description={
        <div className="flex flex-wrap items-center gap-2 text-tiny font-light text-fg-soft">
          <ShipmentStatusBadge status={shipment.status} />
          <span>{shipment.customer}</span>
        </div>
      }
    >
      {tab === undefined ? (
        <p className="text-small font-light text-fg-soft">
          Este envío está {STATUS_LABELS[shipment.status].toLowerCase()} y ya no admite acciones.
        </p>
      ) : (
        <>
          {tabs.length > 1 && (
            <SegmentedControl
              label="Acción"
              options={tabs.map((value) => ({ value, label: TAB_LABELS[value] }))}
              value={tab}
              onChange={setTab}
              className="self-start"
            />
          )}
          {tab === 'assign' && <AssignmentForm shipment={shipment} onDone={onClose} />}
          {tab === 'status' && <StatusForm shipment={shipment} onDone={onClose} />}
          {tab === 'cancel' && <CancelForm shipment={shipment} onDone={onClose} />}
        </>
      )}
    </Dialog>
  );
}
