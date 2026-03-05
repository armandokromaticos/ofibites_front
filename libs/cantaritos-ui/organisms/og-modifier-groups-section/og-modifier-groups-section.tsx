"use client";

import { useState } from "react";

import { Card, CardBody } from "@heroui/react";
import { Plus, Settings } from "lucide-react";

import { AtButton, AtInput } from "@/libs/cantaritos-ui/atoms";
import { MlModifierGroupCard } from "@/libs/cantaritos-ui/molecules";
import {
  useCreateModifier,
  useCreateModifierGroup,
  useUpdateModifierGroup,
} from "@/domain/hooks/products";
import { ModifierGroup } from "@/domain/types";

import { OgModifierGroupsSectionProps } from "./og-modifier-groups-section.types";

export function OgModifierGroupsSection({
  productId,
  modifierGroups,
}: OgModifierGroupsSectionProps) {
  // Group form state
  const [showGroupForm, setShowGroupForm] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ModifierGroup | null>(null);
  const [groupName, setGroupName] = useState("");
  const [minSelect, setMinSelect] = useState("0");
  const [maxSelect, setMaxSelect] = useState("1");

  // Modifier form state
  const [addingModifierGroupId, setAddingModifierGroupId] = useState<string | null>(null);
  const [modifierName, setModifierName] = useState("");
  const [modifierPrice, setModifierPrice] = useState("0");

  const createGroup = useCreateModifierGroup();
  const updateGroup = useUpdateModifierGroup();
  const createModifier = useCreateModifier();

  const resetGroupForm = () => {
    setGroupName("");
    setMinSelect("0");
    setMaxSelect("1");
    setEditingGroup(null);
    setShowGroupForm(false);
  };

  const resetModifierForm = () => {
    setModifierName("");
    setModifierPrice("0");
    setAddingModifierGroupId(null);
  };

  const handleOpenCreateGroup = () => {
    setEditingGroup(null);
    setGroupName("");
    setMinSelect("0");
    setMaxSelect("1");
    setShowGroupForm(true);
  };

  const handleOpenEditGroup = (group: ModifierGroup) => {
    setEditingGroup(group);
    setGroupName(group.name);
    setMinSelect(group.minSelect.toString());
    setMaxSelect(group.maxSelect.toString());
    setShowGroupForm(true);
  };

  const handleSaveGroup = () => {
    if (!groupName.trim()) return;

    const parsedMin = Number(minSelect);
    const parsedMax = Number(maxSelect);
    if (!Number.isFinite(parsedMin) || parsedMin < 0) return;
    if (!Number.isFinite(parsedMax) || parsedMax < 1) return;
    if (parsedMin > parsedMax) return;

    const data = {
      name: groupName.trim(),
      minSelect: parsedMin,
      maxSelect: parsedMax,
    };

    if (editingGroup) {
      updateGroup.mutate(
        { productId, id: editingGroup.id, data },
        { onSuccess: resetGroupForm },
      );
    } else {
      createGroup.mutate(
        { productId, data },
        { onSuccess: resetGroupForm },
      );
    }
  };

  const handleOpenAddModifier = (groupId: string) => {
    setAddingModifierGroupId(groupId);
    setModifierName("");
    setModifierPrice("0");
  };

  const handleSaveModifier = () => {
    if (!addingModifierGroupId || !modifierName.trim()) return;

    createModifier.mutate(
      {
        productId,
        groupId: addingModifierGroupId,
        data: {
          name: modifierName.trim(),
          priceAdjustment: parseFloat(modifierPrice) || 0,
        },
      },
      { onSuccess: resetModifierForm },
    );
  };

  const isSavingGroup = createGroup.isPending || updateGroup.isPending;

  return (
    <Card shadow="sm">
      <CardBody className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Grupos de Modificadores</h2>
          </div>
          <AtButton
            variant="light"
            size="sm"
            color="primary"
            startContent={<Plus className="h-4 w-4" />}
            onPress={handleOpenCreateGroup}
          >
            Agregar Grupo
          </AtButton>
        </div>

        <div className="space-y-4">
          {modifierGroups.map((group: ModifierGroup) => (
            <div key={group.id} className="space-y-2">
              <MlModifierGroupCard
                group={group}
                onEdit={handleOpenEditGroup}
              />

              {/* Inline modifier form for this group */}
              {addingModifierGroupId === group.id ? (
                <div className="ml-4 flex items-end gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                  <div className="flex-1">
                    <AtInput
                      size="sm"
                      label="Nombre del modificador"
                      placeholder="Ej: Chile habanero"
                      value={modifierName}
                      onValueChange={setModifierName}
                      isDisabled={createModifier.isPending}
                    />
                  </div>
                  <div className="w-32">
                    <AtInput
                      size="sm"
                      label="Ajuste precio"
                      type="number"
                      step="0.01"
                      startContent={<span className="text-sm text-gray-400">$</span>}
                      value={modifierPrice}
                      onValueChange={setModifierPrice}
                      isDisabled={createModifier.isPending}
                    />
                  </div>
                  <AtButton
                    color="primary"
                    size="sm"
                    onPress={handleSaveModifier}
                    isLoading={createModifier.isPending}
                  >
                    Agregar
                  </AtButton>
                  <AtButton
                    variant="light"
                    size="sm"
                    onPress={resetModifierForm}
                    isDisabled={createModifier.isPending}
                  >
                    Cancelar
                  </AtButton>
                </div>
              ) : (
                <div className="flex justify-end">
                  <AtButton
                    variant="light"
                    size="sm"
                    color="primary"
                    startContent={<Plus className="h-3 w-3" />}
                    onPress={() => handleOpenAddModifier(group.id)}
                  >
                    Modificador
                  </AtButton>
                </div>
              )}
            </div>
          ))}

          {/* Inline form for create/edit group */}
          {showGroupForm && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
              <h3 className="text-sm font-semibold">
                {editingGroup ? "Editar Grupo" : "Nuevo Grupo de Modificadores"}
              </h3>
              <AtInput
                label="Nombre del grupo"
                placeholder="Ej: Tipo de chile"
                value={groupName}
                onValueChange={setGroupName}
                isDisabled={isSavingGroup}
              />
              <div className="grid grid-cols-2 gap-4">
                <AtInput
                  label="Min. seleccion"
                  type="number"
                  min="0"
                  value={minSelect}
                  onValueChange={setMinSelect}
                  isDisabled={isSavingGroup}
                />
                <AtInput
                  label="Max. seleccion"
                  type="number"
                  min="1"
                  value={maxSelect}
                  onValueChange={setMaxSelect}
                  isDisabled={isSavingGroup}
                />
              </div>
              <div className="flex justify-end gap-2">
                <AtButton
                  variant="light"
                  size="sm"
                  onPress={resetGroupForm}
                  isDisabled={isSavingGroup}
                >
                  Cancelar
                </AtButton>
                <AtButton
                  color="primary"
                  size="sm"
                  onPress={handleSaveGroup}
                  isLoading={isSavingGroup}
                >
                  {editingGroup ? "Guardar" : "Crear"}
                </AtButton>
              </div>
            </div>
          )}

          {modifierGroups.length === 0 && !showGroupForm && (
            <p className="py-4 text-center text-sm text-gray-500">
              No hay grupos de modificadores. Agrega uno para ofrecer opciones personalizables.
            </p>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
