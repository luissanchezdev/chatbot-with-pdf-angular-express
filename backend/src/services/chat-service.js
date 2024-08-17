const OpenAI = require("openai");
const fs = require("fs");
const path = require("path");
const user = require("../models/user");
const dotenv = require("dotenv");
const { all } = require("../routes/auth");
const ObjectId = require("mongodb").ObjectId;
dotenv.config();

class ChatService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.assistant = null;
    this.thread = null;
    this.fileId = null;
    this.fileName = null;
  }

  async initializeAssistant(companyId, fileId) {
    try {
      companyId = new ObjectId(companyId);
      const company = await user.findById(companyId);

      if (!company.id_assistant) {
        // Crear un nuevo asistente si no existe

        const createAssistant = async () => {
          await this.openai.beta.assistants.create({
            name: `BlaperChat-${companyId}`,
            instructions:
              "Eres un experto en servicio al cliente. Ayuda a los clientes a resolver sus problemas. Usa solo la información del documento proporcionado para responder a las preguntas. Genera respuestas claras y concisas. Y recuerda, ¡siempre sé amable y educado!, y no compartas información personal, ni indiques que eres una IA. Puedes generar resumenes del docuemento. Evitar usar notaciond de referencias",
            tools: [{ type: "file_search" }],
            model: "gpt-4o-mini",
          })
          .then((response) => {
            this.assistant = response;
          })
          .catch((error) => {
            console.error("Error al crear asistente", error);
          })
        }

        await createAssistant();

        // Guardar el ID del asistente en la base de datos
        console.log("Antes de guardar el id assistant");
        /* console.log({
          files: this.assistant.tools.tool_resources.file_search ? this.assistant.tools.tool_resources.file_search : null
        }); */
        
        await user.updateOne(
          { _id: companyId },
          { id_assistant: this.assistant.id }
        );
      } else {
        // Recuperar el asistente existente
        console.log("Recuperando asistente existente");
        this.assistant = await this.openai.beta.assistants.retrieve(
          company.id_assistant
        );
      }

      if (!this.thread) {
        this.thread = await this.openai.beta.threads.create();
      }
    } catch (error) {
      console.error("Error iniciando el asistente:", error);
      throw new Error("Fallo al iniciar el asistente");
    }
  }

  async uploadFile(req, filePath, companyId) {
    console.log({
      filePath,
      companyId,
    });

    try {
      console.log("Creando el asistant o verificando si existe");
      await this.initializeAssistant(companyId);

      console.log("after initialize assistant");

      console.log({ assistant: this.assistant });
      const vectorStoreIdsCurrent =
        this.assistant.tool_resources.file_search.vector_store_ids ? this.assistant.tool_resources.file_search.vector_store_ids : null;
      console.log({
        vector_store_ids_old:
          this.assistant.tool_resources.file_search.vector_store_ids ? this.assistant.tool_resources.file_search.vector_store_ids : null,
      });

      const currentVectorStore = this.assistant.tool_resources.file_search.vector_store_ids ? this.assistant.tool_resources.file_search.vector_store_ids : null

      // Creando el archivo para el asistente

      const createFile = async () => {
        await this.openai.files
          .create({
            file: fs.createReadStream(req.file.path),
            purpose: "assistants",
          })
          .then(async (response) => {
            console.log({ response });
            this.fileId = response.id;
            await user.updateOne({ _id: new ObjectId(companyId) }, { current_file_id: response.id });
            await user.updateOne({ _id: new ObjectId(companyId) }, { current_file_name: response.filename });
            console.log("file created");
          })

          .catch((error) => {
            console.error("Error al crear archivo", error);
          });
      };

      await createFile();

      this.fileName = path.basename(filePath);

      

      // Verificar si el archivo se lee correctamente
      if (!fs.existsSync(filePath)) {
        console.log("file does not exist");
        throw new Error(`File does not exist at path: ${filePath}`);
      }

      // USANDO VECTORES

      let vectorStore;

      // actualizar vector store
      const updateVectorStore = async () => {
        await this.openai.beta.vectorStores.fileBatches
        .createAndPoll(currentVectorStore, {
          file_ids: [`${this.fileId}`],
        })
        .then((response) => {
          console.log("Archivo del vector actualizado");
          return;
        })
        .catch((error) => {
          console.error("Error al actualizar archivos del vector", error);
          return;
        });
      }

      if(vectorStoreIdsCurrent.length > 0){
        await updateVectorStore();
        return this.fileId
      }

      console.log({
        fieldId : this.fileId
      })



      // Crear vector store

      const createVectorStore = async () => {
        await this.openai.beta.vectorStores
          .create({
            name:`Vector Blaper Chat - ${companyId}`,
          })
          .then((response) => {
            vectorStore = response;
          })
          .catch((error) => {
            console.error("Error al crear vector store", error);
          });
      };

      await createVectorStore();

      console.log({ vectorStore });

      console.log({ assistant_id: this.assistant.id });
      console.log( this.fileId)

      await this.openai.beta.vectorStores.fileBatches
        .createAndPoll(vectorStore.id, {
          file_ids: [`${this.fileId}`],
        })
        .then((response) => {
          console.log("archivos agregados al vector");
          return;
        })
        .catch((error) => {
          console.error("Error al agregar archivos al vector", error);
          return;
        });

      // Asignación del vector al assistant
      await this.openai.beta.assistants
        .update(this.assistant.id, {
          tool_resources: {
            file_search: { vector_store_ids: [vectorStore.id] },
          },
        })
        .then((response) => console.log("Vector asignado al assistant"))
        .catch((error) =>
          console.error("Error al asignar vector al assistant", error)
        );

      return this.fileId;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw new Error("Failed to upload file.");
    }
  }

  async sendMessage(message, companyId) {
    try {
      await this.initializeAssistant(companyId);
      console.log({ companyId})
      if (!this.assistant || !this.thread) {
        throw new Error(
          "Chat no disponible. Por favor, sube un documento primero."
        );
      }

      companyId = new ObjectId(companyId);
      const company = await user.findById(companyId);
      if (!company.current_file_id) {
        throw new Error(
          "No document uploaded. Please upload a document first."
        );
      }

      await this.openai.beta.threads.messages.create(this.thread.id, {
        role: "user",
        content: message,
      });

      const run = await this.openai.beta.threads.runs.create(this.thread.id, {
        assistant_id: this.assistant.id,
      });

      let runStatus = await this.openai.beta.threads.runs.retrieve(
        this.thread.id,
        run.id
      );
      while (runStatus.status !== "completed") {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        runStatus = await this.openai.beta.threads.runs.retrieve(
          this.thread.id,
          run.id
        );
      }

      const messages = await this.openai.beta.threads.messages.list(
        this.thread.id
      );
      return messages.data[0].content[0].text.value;
    } catch (error) {
      console.error("Error sending message:", error);
      throw new Error("Failed to send message.");
    }
  }

  async hasFile(companyId) {
    console.log({ companyId });
    try {
      companyId = new ObjectId(companyId);
      console.log({ companyId });
      const company = await user.findById(companyId)
       
        return !!company.current_file_id;
       
      
    } catch (error) {
      console.error("Error comprobando el archivo:", error);
      throw new Error("Falla al verificar el estado del archivo.");
    }
  }

  async getFileName(companyId) {
    try {
      companyId = new ObjectId(companyId);
      const company = await user.findById(companyId);
      console.log({
        companyFromGetFileName: company
      })
      return company.current_file_name || "No file uploaded";
    } catch (error) {
      console.error("Error encontrando el nombre del archivo", error);
      throw new Error("Fallo al recuperar el nombre del archivo.");
    }
  }

  async getChatList(companyId) {
    try {
      companyId = new ObjectId(companyId);
      const allCompanies = await user.find();
      console.log({ allCompanies });
      const companiesWithChat = allCompanies.filter(company => { return company.userType != "client" && company.id_assistant != null });

      const companiesNewArray = companiesWithChat.map(company => {
        return {
          _id: company._id,
          username: company.username.toUpperCase(),
          id_assistant: company.id_assistant,
          current_file_id: company.current_file_id,
          current_file_name: company.current_file_name
        }
      });

      console.log({ companiesNewArray });

      /* companyId = new ObjectId(companyId);
      const company = await user.findById(companyId);
      console.log({
        companyFromGetChatList: company
      })
      return company.chat_list || []; */

      return companiesNewArray;
    } catch (error) {
      console.error("Error obteniendo la lista de chat", error);
      throw new Error("Fallo al recuperar la lista de chat.");
    }
  }
}

module.exports = new ChatService();
