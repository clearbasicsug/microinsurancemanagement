import Mtp from '../pages/Mtp'
import Claims from '../pages/Claims'
import Reports from '../pages/Reports'
import Clients from '../pages/Clients'
import Policies from '../pages/Policies'
import Settings from '../pages/Settings'
import PrivateRoute  from './PrivateRoute'
import Dashboard from '../pages/Dashboard'
import Windscreen from '../pages/Windscreen'
import Comprehensive from '../pages/Comprehensive'
import Organisations from '../pages/admin/Organisations'
import Logs from '../pages/Logs.js'
import Supervisors from '../pages/admin/Supervisors'
import Agents from '../pages/Agents'
import AddClaims from '../pages/AddClaims'
import AddOrganisation from '../pages/admin/AddOrganisation'
import StickerMgt from '../pages/admin/StickerMgt'
import AddUsers from '../pages/AddUsers'
import NewImport from '../pages/NewImport'
import Transit from '../pages/Transit'
import AddStickerRange from '../pages/admin/AddStickerRange'
import PolicyDetails from '../pages/PolicyDetails/PolicyDetails'
import PolicyRenew from '../pages/PolicyDetails/PolicyRenew'


function AdminRoutes() {
    return (
        <>
            <PrivateRoute path="/admin/dashboard" >
                <Dashboard />
            </PrivateRoute>
            <PrivateRoute path="/admin/organisations" >
                <Organisations />
            </PrivateRoute>
            <PrivateRoute path="/admin/add-organisations" >
                <AddOrganisation />
            </PrivateRoute>
            <PrivateRoute path="/admin/view-log-trail" >
                <Logs />
            </PrivateRoute>
            <PrivateRoute path="/admin/supervisor" >
                <Supervisors />
            </PrivateRoute>
            <PrivateRoute path="/admin/agents" >
                <Agents />
            </PrivateRoute>
            <PrivateRoute path="/admin/clients" >
                <Clients />
            </PrivateRoute>
            <PrivateRoute path="/admin/sticker-management" >
                <StickerMgt />
            </PrivateRoute>
            <PrivateRoute path="/admin/sticker-number" >
                <AddStickerRange />
            </PrivateRoute>
            <PrivateRoute path="/admin/user-management" >
                <Supervisors />
            </PrivateRoute>
            <PrivateRoute path="/admin/policies" >
                <Policies />
            </PrivateRoute>
            <PrivateRoute path="/admin/claims" >
                <Claims />
            </PrivateRoute>
            <PrivateRoute path="/admin/reports" >
                <Reports />
            </PrivateRoute>
            <PrivateRoute path="/admin/settings" >
                <Settings />
            </PrivateRoute>
            <PrivateRoute path={`/admin/policy-details/:id`} >
                <PolicyDetails />
            </PrivateRoute>
            <PrivateRoute path={`/admin/policy-renew/:id`} >
                <PolicyRenew />
            </PrivateRoute>
            <PrivateRoute path="/admin/motor-third-party" >
                <Mtp />
            </PrivateRoute>
            <PrivateRoute path="/admin/windscreen" >
                <Windscreen />
            </PrivateRoute>
            <PrivateRoute path="/admin/comprehensive" >
                <Comprehensive />
            </PrivateRoute>
            <PrivateRoute path="/admin/new-import" >
                <NewImport />
            </PrivateRoute>
            <PrivateRoute path="/admin/transit" >
                <Transit />
            </PrivateRoute>
            <PrivateRoute path="/add-claim" >
                <AddClaims />
            </PrivateRoute>
            <PrivateRoute path="/admin/add-agent" >
                <AddUsers role="agent" />
            </PrivateRoute>
            <PrivateRoute path="/admin/add-supervisor" >
                <AddUsers role="supervisor" />
            </PrivateRoute>
        </>
        
    )
}

export default AdminRoutes
