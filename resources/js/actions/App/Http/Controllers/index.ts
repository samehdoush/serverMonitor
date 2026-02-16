import DashboardController from './DashboardController'
import ServerController from './ServerController'
import RecipeController from './RecipeController'
import FileSyncController from './FileSyncController'
import BackupController from './BackupController'
import SettingsController from './SettingsController'
import MenuBarController from './MenuBarController'
const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
ServerController: Object.assign(ServerController, ServerController),
RecipeController: Object.assign(RecipeController, RecipeController),
FileSyncController: Object.assign(FileSyncController, FileSyncController),
BackupController: Object.assign(BackupController, BackupController),
SettingsController: Object.assign(SettingsController, SettingsController),
MenuBarController: Object.assign(MenuBarController, MenuBarController),
}

export default Controllers