import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import * as XLSX from 'xlsx';

interface EventExportProps {
  eventId: Id<"events">;
}

export function EventExport({ eventId }: EventExportProps) {
  const [isExporting, setIsExporting] = useState(false);
  const event = useQuery(api.events.getById, { id: eventId });
  const registrations = useQuery(api.participantRegistrations.getRegistrationsByEvent, { eventId });

  const exportToExcel = () => {
    if (!registrations || !event) return;
    
    setIsExporting(true);
    
    try {
      // Format data for export
      const exportData = registrations.map(reg => {
        const baseData = {
          "Name": reg.fullName,
          "Email": reg.emailId,
          "Contact": reg.contactNumber,
          "College": reg.collegeUniversity,
          "Team Name": reg.teamName || "N/A",
          "Registration Date": new Date(reg.registeredAt).toLocaleDateString()
        };
        
        // Add event-specific fields
        const category = event.category?.toLowerCase();
        if (category === "hackathon") {
          return {
            ...baseData,
            "Technical Skills": reg.technicalSkills || "",
            "Project Idea": reg.previousExperience || "" // Using previousExperience instead
          };
        } else if (category === "project competition") {
          return {
            ...baseData,
            "Project Title": reg.teamName || "", // Using teamName instead of projectTitle
            "Project Domain": reg.technicalSkills || "" // Using technicalSkills instead of projectDomain
          };
        }
        
        return baseData;
      });
      
      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      
      // Create workbook
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
      
      // Generate Excel file
      const fileName = `${event.title}_Registrations.xlsx`;
      XLSX.writeFile(workbook, fileName);
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-silver">
          Registrations: {registrations?.length || 0}
        </h3>
        
        <button
          onClick={exportToExcel}
          disabled={isExporting || !registrations?.length}
          className={`px-4 py-2 rounded font-medium ${
            isExporting || !registrations?.length
              ? "bg-medium-blue/30 text-silver/50 cursor-not-allowed"
              : "bg-accent-blue hover:bg-accent-blue/80 text-silver"
          }`}
        >
          {isExporting ? "Exporting..." : "Export to Excel"}
        </button>
      </div>
      
      {registrations && registrations.length > 0 ? (
        <div className="border border-medium-blue/30 rounded overflow-hidden">
          <table className="w-full">
            <thead className="bg-medium-blue/20">
              <tr>
                <th className="p-2 text-left text-silver">Name</th>
                <th className="p-2 text-left text-silver">Email</th>
                <th className="p-2 text-left text-silver">College</th>
              </tr>
            </thead>
            <tbody>
              {registrations.slice(0, 5).map((reg, index) => (
                <tr key={index} className={index % 2 === 0 ? "bg-medium-blue/10" : ""}>
                  <td className="p-2 text-silver/90">{reg.fullName}</td>
                  <td className="p-2 text-silver/90">{reg.emailId}</td>
                  <td className="p-2 text-silver/90">{reg.collegeUniversity}</td>
                </tr>
              ))}
              {registrations.length > 5 && (
                <tr>
                  <td colSpan={3} className="p-2 text-center text-silver/70">
                    + {registrations.length - 5} more registrations
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-4 border border-medium-blue/30 rounded">
          <p className="text-silver/70">No registrations for this event yet</p>
        </div>
      )}
    </div>
  );
}