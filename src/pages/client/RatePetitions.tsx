import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, CheckCircle } from 'lucide-react';
import { DatabaseService, Petition } from '../../services/databaseService';
import { useNewAuth } from '../../contexts/NewAuthContext';
import RatingModal from '../../components/ratings/RatingModal';

const RatePetitions: React.FC = () => {
  const { user } = useNewAuth();
  const [petitionsToRate, setPetitionsToRate] = useState<Petition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPetition, setSelectedPetition] = useState<Petition | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);

  useEffect(() => {
    if (user?.id) {
      loadPetitionsToRate();
    }
  }, [user?.id]);

  const loadPetitionsToRate = async () => {
    try {
      setLoading(true);
      const petitions = await DatabaseService.getCompletedPetitionsForRating(user?.id!);
      setPetitionsToRate(petitions);
    } catch (error) {
      console.error('Error loading petitions to rate:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRateWriter = (petition: Petition) => {
    setSelectedPetition(petition);
    setShowRatingModal(true);
  };

  const handleRatingSubmitted = () => {
    // Reload petitions after rating is submitted
    loadPetitionsToRate();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-8"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Avaliar Redatores</h1>
        <p className="text-gray-600">
          Avalie o trabalho dos redatores para ajudar outros clientes e melhorar nossos serviços
        </p>
      </div>

      {petitionsToRate.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Todas as avaliações em dia!
          </h3>
          <p className="text-gray-600">
            Você já avaliou todos os redatores das suas petições concluídas.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Star className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-medium text-orange-900 mb-1">
                  Sua opinião é importante!
                </h3>
                <p className="text-orange-800 text-sm">
                  Avalie o trabalho dos redatores para ajudar outros clientes e melhorar nossos serviços.
                </p>
              </div>
            </div>
          </div>

          {petitionsToRate.map((petition) => (
            <div key={petition.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <h3 className="text-lg font-medium text-gray-900">{petition.title}</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <span className="font-medium">Tipo:</span> {petition.type}
                    </div>
                    <div>
                      <span className="font-medium">Concluída em:</span> {new Date(petition.updated_at).toLocaleDateString('pt-BR')}
                    </div>
                    <div>
                      <span className="font-medium">Valor:</span> R$ {petition.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm">
                    Esta petição foi concluída com sucesso. Que tal avaliar o trabalho do redator?
                  </p>
                </div>

                <div className="ml-6">
                  <button
                    onClick={() => handleRateWriter(petition)}
                    className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    <Star className="h-4 w-4" />
                    <span>Avaliar Redator</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedPetition && (
        <RatingModal
          isOpen={showRatingModal}
          onClose={() => setShowRatingModal(false)}
          petition={selectedPetition}
          onRatingSubmitted={handleRatingSubmitted}
        />
      )}
    </div>
  );
};

export default RatePetitions;