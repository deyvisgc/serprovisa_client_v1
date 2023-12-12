export interface topcard {
    bgcolor: string,
    icon: string,
    title: string,
    subtitle: string
}

export const topcards: topcard[] = [

    {
        bgcolor: 'success',
        icon: 'fas fa-house',
        title: '$21k',
        subtitle: 'Familias registradas'
    },
    {
        bgcolor: 'danger',
        icon: 'fas fa-clipboard-list',
        title: '$1k',
        subtitle: 'Lineas registradas'
    },
    {
        bgcolor: 'warning',
        icon: 'fas fa-layer-group',
        title: '456',
        subtitle: 'Grupos registradas'
    },
    {
        bgcolor: 'info',
        icon: 'fas fa-box', 
        title: '210',
        subtitle: 'Productos registradas'
    },

] 