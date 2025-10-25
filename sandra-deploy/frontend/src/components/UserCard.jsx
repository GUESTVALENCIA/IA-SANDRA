import React from 'react';
import PropTypes from 'prop-types';

/**
 * UserCard Component
 * Tarjeta de usuario con información y acciones
 */
const UserCard = ({ 
  user, 
  onEdit, 
  onDelete, 
  onViewDetails,
  className = '' 
}) => {
  const {
    id,
    name,
    email,
    role,
    avatar,
    status = 'active',
    lastLogin,
    createdAt
  } = user;

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || colors.inactive;
  };

  const getRoleBadge = (role) => {
    const badges = {
      admin: 'bg-purple-100 text-purple-800',
      user: 'bg-blue-100 text-blue-800',
      moderator: 'bg-indigo-100 text-indigo-800',
      guest: 'bg-gray-100 text-gray-800'
    };
    return badges[role] || badges.guest;
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden ${className}`}>
      {/* Header con Avatar */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6">
        <div className="flex items-center space-x-4">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full border-4 border-white bg-white flex items-center justify-center">
              <span className="text-xl font-bold text-gray-700">
                {getInitials(name)}
              </span>
            </div>
          )}
          
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white truncate">
              {name}
            </h3>
            <p className="text-blue-100 text-sm truncate">
              {email}
            </p>
          </div>

          {/* Status Badge */}
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
      </div>

      {/* Body con Información */}
      <div className="p-6 space-y-4">
        {/* Role */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Rol:</span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(role)}`}>
            {role}
          </span>
        </div>

        {/* Last Login */}
        {lastLogin && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Último acceso:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(lastLogin)}
            </span>
          </div>
        )}

        {/* Created At */}
        {createdAt && (
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Miembro desde:</span>
            <span className="text-sm font-medium text-gray-900">
              {formatDate(createdAt)}
            </span>
          </div>
        )}

        {/* User ID */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200">
          <span className="text-xs text-gray-500">ID:</span>
          <span className="text-xs font-mono text-gray-700">
            {id}
          </span>
        </div>
      </div>

      {/* Footer con Acciones */}
      <div className="bg-gray-50 px-6 py-4 flex items-center justify-end space-x-2">
        {onViewDetails && (
          <button
            onClick={() => onViewDetails(user)}
            className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
            aria-label="Ver detalles"
          >
            Ver detalles
          </button>
        )}
        
        {onEdit && (
          <button
            onClick={() => onEdit(user)}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
            aria-label="Editar usuario"
          >
            Editar
          </button>
        )}
        
        {onDelete && (
          <button
            onClick={() => onDelete(user)}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors duration-200"
            aria-label="Eliminar usuario"
          >
            Eliminar
          </button>
        )}
      </div>
    </div>
  );
};

UserCard.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    role: PropTypes.string,
    avatar: PropTypes.string,
    status: PropTypes.oneOf(['active', 'inactive', 'suspended', 'pending']),
    lastLogin: PropTypes.string,
    createdAt: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onViewDetails: PropTypes.func,
  className: PropTypes.string
};

export default UserCard;
