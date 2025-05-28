"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import axios from "axios";
import ImageCropper from "@/components/ui/ImageCropper";

interface Usuario {
  id: number;
  email: string;
  fotoPerfil: string;
  Nome: string;
  Titulacao: string;
  instituicaoEnsino: string;
  formacaoAcademica: string;
  resumoPessoal: string;
  tipo: string;
  createdAt: string;
  link: Array<{
    id: number;
    link: string;
    tipo: string;
  }>;
  publicacao: Array<{
    id: number;
    descricao: string;
    link: string;
  }>;
  carreira: Array<{
    id: number;
    nome: string;
    descricao: string;
    categoria: string;
    dataInicio: string;
    dataFim: string;
  }>;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [showImageCropper, setShowImageCropper] = useState(false);
  const [formData, setFormData] = useState({
    Nome: "",
    email: "",
    Titulacao: "",
    instituicaoEnsino: "",
    formacaoAcademica: "",
    resumoPessoal: "",
  });

  // Redirect se não estiver logado
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Carregar dados do usuário
  useEffect(() => {
    const fetchUsuario = async () => {
      if (session?.user?.id) {
        try {
          const response = await axios.get(`/api/usuario?id=${session.user.id}`);
          setUsuario(response.data);
          setFormData({
            Nome: response.data.Nome || "",
            email: response.data.email || "",
            Titulacao: response.data.Titulacao || "",
            instituicaoEnsino: response.data.instituicaoEnsino || "",
            formacaoAcademica: response.data.formacaoAcademica || "",
            resumoPessoal: response.data.resumoPessoal || "",
          });
        } catch (error) {
          console.error("Erro ao carregar usuário:", error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchUsuario();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const response = await axios.patch(`/api/usuario?id=${session?.user?.id}`, formData);
      if (response.status === 200) {
        setUsuario(prev => prev ? { ...prev, ...formData } : null);
        setEditMode(false);
        alert("Perfil atualizado com sucesso!");
      }
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      alert(error.response?.data?.error || "Erro ao atualizar perfil");
    }
  };

  const handleImageUploadSuccess = (newImageBase64: string) => {
    setUsuario(prev => prev ? { ...prev, fotoPerfil: newImageBase64 } : null);
    setShowImageCropper(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-700">Usuário não encontrado</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-800">Meu Perfil</h1>
            <div className="space-x-3">
              {editMode ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditMode(false)}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition"
                  >
                    Cancelar
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Editar Perfil
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Foto de Perfil e Informações Básicas */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
            {/* Foto de Perfil */}
            <div className="relative group">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                {usuario.fotoPerfil ? (
                  <img
                    src={usuario.fotoPerfil}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-gray-400 text-4xl">👤</div>
                )}
              </div>
              <button
                onClick={() => setShowImageCropper(true)}
                className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
              >
                📷
              </button>
            </div>

            {/* Informações Básicas */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{usuario.Nome}</h2>
              <p className="text-gray-600 mb-1">{usuario.email}</p>
              <p className="text-gray-600 mb-1">{usuario.Titulacao}</p>
              <p className="text-gray-600 mb-1">{usuario.instituicaoEnsino}</p>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                usuario.tipo === 'Normal' ? 'bg-green-100 text-green-800' :
                usuario.tipo === 'Super' ? 'bg-blue-100 text-blue-800' :
                usuario.tipo === 'Pendente' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {usuario.tipo}
              </span>
            </div>
          </div>
        </div>

        {/* Formulário de Edição */}
        {editMode && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h3 className="text-xl font-semibold mb-4">Editar Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
                <input
                  type="text"
                  name="Nome"
                  value={formData.Nome}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titulação</label>
                <select
                  name="Titulacao"
                  value={formData.Titulacao}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Bacharel">Bacharel</option>
                  <option value="Licenciado">Licenciado</option>
                  <option value="Especialista">Especialista</option>
                  <option value="Mestre">Mestre</option>
                  <option value="Doutor">Doutor</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Instituição de Ensino</label>
                <input
                  type="text"
                  name="instituicaoEnsino"
                  value={formData.instituicaoEnsino}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Formação Acadêmica</label>
                <input
                  type="text"
                  name="formacaoAcademica"
                  value={formData.formacaoAcademica}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Resumo Pessoal</label>
                <textarea
                  name="resumoPessoal"
                  value={formData.resumoPessoal}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Informações Adicionais - Apenas Visualização */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Links */}
          {usuario.link && usuario.link.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Links</h3>
              <div className="space-y-2">
                {usuario.link.map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium text-gray-600">{link.tipo}</span>
                    <a
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate ml-2"
                    >
                      {link.link}
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Publicações */}
          {usuario.publicacao && usuario.publicacao.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Publicações</h3>
              <div className="space-y-3">
                {usuario.publicacao.map((pub) => (
                  <div key={pub.id} className="p-3 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700 mb-2">{pub.descricao}</p>
                    <a
                      href={pub.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Ver publicação →
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Carreira */}
          {usuario.carreira && usuario.carreira.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
              <h3 className="text-xl font-semibold mb-4">Experiência</h3>
              <div className="space-y-4">
                {usuario.carreira.map((exp) => (
                  <div key={exp.id} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-gray-800">{exp.nome}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        exp.categoria === 'acadêmica' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {exp.categoria}
                      </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-2">
                      {formatDate(exp.dataInicio)} - {formatDate(exp.dataFim)}
                    </p>
                    <p className="text-gray-700 text-sm">{exp.descricao}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Informações da Conta */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-6">
          <h3 className="text-xl font-semibold mb-4">Informações da Conta</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">ID:</span>
              <span className="ml-2 text-gray-600">{usuario.id}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Membro desde:</span>
              <span className="ml-2 text-gray-600">{formatDate(usuario.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal do Image Cropper */}
      {showImageCropper && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Alterar Foto de Perfil</h3>
                <button
                  onClick={() => setShowImageCropper(false)}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>
              <ImageCropper
                userId={session?.user?.id || ""}
                onUploadSuccess={handleImageUploadSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}