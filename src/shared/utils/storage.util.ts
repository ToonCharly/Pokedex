// shared/utils/storage.util.ts
import type { StorageData } from "../models";
import { STORAGE_KEY, BACKUP_KEY } from "../constants";

/**
 * Utilidad para gestionar el almacenamiento local de datos del equipo
 */
export class StorageUtil {
  /**
   * Carga los datos del equipo desde localStorage
   */
  static loadTeamData(): StorageData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error("Error al cargar datos del equipo:", error);
      // Intentar cargar backup
      try {
        const backup = localStorage.getItem(BACKUP_KEY);
        if (backup) {
          console.log("Restaurando desde backup...");
          return JSON.parse(backup);
        }
      } catch (backupError) {
        console.error("Error al cargar backup:", backupError);
      }
    }

    // Retornar datos por defecto si no hay datos guardados
    return {
      team: [],
      lastUpdated: null,
      settings: {
        maxTeamSize: 6,
        autoSave: true,
      },
    };
  }

  /**
   * Guarda los datos del equipo en localStorage
   */
  static saveTeamData(data: StorageData): boolean {
    try {
      // Crear backup antes de guardar
      const current = localStorage.getItem(STORAGE_KEY);
      if (current) {
        localStorage.setItem(BACKUP_KEY, current);
      }

      // Guardar nuevos datos
      const dataWithTimestamp = {
        ...data,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataWithTimestamp));
      return true;
    } catch (error) {
      console.error("Error al guardar datos del equipo:", error);
      return false;
    }
  }

  /**
   * Exporta los datos del equipo como archivo JSON descargable
   */
  static exportTeamToJSON(data: StorageData): void {
    try {
      const jsonString = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonString], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `pokedex-team-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al exportar datos:", error);
    }
  }

  /**
   * Importa datos del equipo desde un archivo JSON
   */
  static importTeamFromJSON(file: File): Promise<StorageData> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          // Validar estructura básica
          if (data && Array.isArray(data.team)) {
            resolve(data);
          } else {
            reject(new Error("Formato de archivo inválido"));
          }
        } catch {
          reject(new Error("Error al parsear JSON"));
        }
      };
      reader.onerror = () => reject(new Error("Error al leer archivo"));
      reader.readAsText(file);
    });
  }

  /**
   * Limpia todos los datos guardados
   */
  static clearAllData(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(BACKUP_KEY);
  }

  /**
   * Obtiene el tamaño de los datos guardados en KB
   */
  static getStorageSize(): number {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        return new Blob([data]).size / 1024;
      }
    } catch {
      // Error ignorado
    }
    return 0;
  }
}

// Re-exportar funciones para compatibilidad con código existente
export const loadTeamData = () => StorageUtil.loadTeamData();
export const saveTeamData = (data: StorageData) => StorageUtil.saveTeamData(data);
export const exportTeamToJSON = (data: StorageData) => StorageUtil.exportTeamToJSON(data);
export const importTeamFromJSON = (file: File) => StorageUtil.importTeamFromJSON(file);
export const clearAllData = () => StorageUtil.clearAllData();
export const getStorageSize = () => StorageUtil.getStorageSize();
