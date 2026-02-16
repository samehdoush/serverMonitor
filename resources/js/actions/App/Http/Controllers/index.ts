import DashboardController from './DashboardController'
import ServerController from './ServerController'
import BackupController from './BackupController'
import SettingsController from './SettingsController'
const Controllers = {
    DashboardController: Object.assign(DashboardController, DashboardController),
ServerController: Object.assign(ServerController, ServerController),
BackupController: Object.assign(BackupController, BackupController),
SettingsController: Object.assign(SettingsController, SettingsController),
}

export default Controllers